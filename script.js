
BasketPoolQuantity = function ()
{
    this.processing = false;
    this.poolQuantity = {};
    this.updateTimer = null;
    this.currentQuantity = {};
    this.lastStableQuantities = {};

    this.updateQuantity();
};


BasketPoolQuantity.prototype.updateQuantity = function ()
{
    var items = BX('basket_items');

    if (basketJSParams['USE_ENHANCED_ECOMMERCE'] === 'Y')
    {
        checkAnalytics(this.lastStableQuantities, items);
    }

    if (!!items && items.rows.length > 0)
    {
        for (var i = 1; items.rows.length > i; i++)
        {
            var itemId = items.rows[i].id;
            this.currentQuantity[itemId] = BX('QUANTITY_' + itemId).value;
        }
    }

    this.lastStableQuantities = BX.clone(this.currentQuantity, true);
};


BasketPoolQuantity.prototype.changeQuantity = function (itemId)
{
    var quantity = BX('QUANTITY_' + itemId).value;
    var isPoolEmpty = this.isPoolEmpty();

    if (this.currentQuantity[itemId] && this.currentQuantity[itemId] != quantity)
    {
        this.poolQuantity[itemId] = this.currentQuantity[itemId] = quantity;
    }

    if (!isPoolEmpty)
    {
        this.enableTimer(true);
    } else
    {
        this.trySendPool();
    }
};


BasketPoolQuantity.prototype.trySendPool = function ()
{
    if (!this.isPoolEmpty() && !this.isProcessing())
    {
        this.enableTimer(false);
        recalcBasketAjax({});
    }
};

BasketPoolQuantity.prototype.isPoolEmpty = function ()
{
    return (Object.keys(this.poolQuantity).length == 0);
};

BasketPoolQuantity.prototype.clearPool = function ()
{
    this.poolQuantity = {};
};

BasketPoolQuantity.prototype.isProcessing = function ()
{
    return (this.processing === true);
};

BasketPoolQuantity.prototype.setProcessing = function (value)
{
    this.processing = (value === true);
};

BasketPoolQuantity.prototype.enableTimer = function (value)
{
    clearTimeout(this.updateTimer);
    if (value === false)
        return;

    this.updateTimer = setTimeout(function () {
        basketPoolQuantity.trySendPool();
    }, 1500);
};

/**
 * @param basketItemId
 * @param {{BASKET_ID : string, BASKET_DATA : { GRID : { ROWS : {} }}, COLUMNS: {}, PARAMS: {}, DELETE_ORIGINAL : string }} res
 */
 function updateBasketTable(basketItemId, res)
 {
    var table = BX("basket_items"),
    rows,
    newBasketItemId,
    arItem,
    lastRow,
    newRow,
    arColumns,
    bShowDeleteColumn = false,
    bShowDelayColumn = false,
    bShowPropsColumn = false,
    bShowPriceType = false,
    bUseFloatQuantity,
    origBasketItem,
    oCellMargin,
    i,
    oCellName,
    imageURL,
    cellNameHTML,
    oCellItem,
    cellItemHTML,
    bSkip,
    j,
    val,
    propId,
    arProp,
    bIsImageProperty,
    full,
    arVal,
    valId,
    arSkuValue,
    selected,
    valueId,
    k,
    arItemProp,
    oCellQuantity,
    oCellQuantityHTML,
    ratio,
    isUpdateQuantity,
    oldQuantity,
    oCellPrice,
    fullPrice,
    id,
    oCellDiscount,
    oCellWeight,
    oCellCustom,
    customColumnVal,
    propsMap,
    selectedIndex,
    counter,
    marginLeft,
    createNewItem;

    if (!table || typeof res !== 'object')
    {
        return;
    }

    rows = table.rows;
    lastRow = rows[rows.length - 1];
    bUseFloatQuantity = (res.PARAMS.QUANTITY_FLOAT === 'Y');

    // insert new row instead of original basket item row
    if (basketItemId !== null && !!res.BASKET_DATA)
    {
        origBasketItem = BX(basketItemId);

        newBasketItemId = res.BASKET_ID;
        createNewItem = BX.type.isPlainObject(res.BASKET_DATA.GRID.ROWS[newBasketItemId]);
        if (createNewItem)
        {
            arItem = res.BASKET_DATA.GRID.ROWS[newBasketItemId];
            newRow = document.createElement('tr');

            newRow.setAttribute('id', res.BASKET_ID);
            newRow.setAttribute('data-item-name', arItem['NAME']);
            newRow.setAttribute('data-item-brand', arItem[basketJSParams['BRAND_PROPERTY'] + '_VALUE']);
            newRow.setAttribute('data-item-price', arItem['PRICE']);
            newRow.setAttribute('data-item-currency', arItem['CURRENCY']);

            lastRow.parentNode.insertBefore(newRow, origBasketItem.nextSibling);
        }

        if (res.DELETE_ORIGINAL === 'Y')
        {
            origBasketItem.parentNode.removeChild(origBasketItem);
        }

        if (createNewItem)
        {
            // fill row with fields' values
            oCellMargin = newRow.insertCell(-1);
            oCellMargin.setAttribute('class', 'margin');

            arColumns = res.COLUMNS.split(',');

            for (i = 0; i < arColumns.length; i++)
            {
                if (arColumns[i] === 'DELETE')
                {
                    bShowDeleteColumn = true;
                } else if (arColumns[i] === 'DELAY')
                {
                    bShowDelayColumn = true;
                } else if (arColumns[i] === 'PROPS')
                {
                    bShowPropsColumn = true;
                } else if (arColumns[i] === 'TYPE')
                {
                    bShowPriceType = true;
                }
            }

            for (i = 0; i < arColumns.length; i++)
            {
                switch (arColumns[i])
                {
                    case 'PROPS':
                    case 'DELAY':
                    case 'DELETE':
                    case 'TYPE':
                    break;
                    case 'NAME':
                        // first <td> - image and brand
                        oCellName = newRow.insertCell(-1);
                        imageURL = '';
                        cellNameHTML = '';

                        oCellName.setAttribute('class', 'itemphoto');

                        if (arItem.PREVIEW_PICTURE_SRC.length > 0)
                        {
                            imageURL = arItem.PREVIEW_PICTURE_SRC;
                        } else if (arItem.DETAIL_PICTURE_SRC.length > 0)
                        {
                            imageURL = arItem.DETAIL_PICTURE_SRC;
                        } else
                        {
                            imageURL = basketJSParams.TEMPLATE_FOLDER + '/images/no_photo.png';
                        }

                        if (arItem.DETAIL_PAGE_URL.length > 0)
                        {
                            cellNameHTML = '<div class="bx_ordercart_photo_container">\
                            <a href="' + arItem.DETAIL_PAGE_URL + '">\
                            <div class="bx_ordercart_photo" style="background-image:url(\'' + imageURL + '\')"></div>\
                            </a>\
                            </div>';
                        } else
                        {
                            cellNameHTML = '<div class="bx_ordercart_photo_container">\
                            <div class="bx_ordercart_photo" style="background-image:url(\'' + imageURL + '\')"></div>\
                            </div>';
                        }

                        if (arItem.BRAND && arItem.BRAND.length > 0)
                        {
                            cellNameHTML += '<div class="bx_ordercart_brand">\
                            <img alt="" src="' + arItem.BRAND + '"/>\
                            </div>';
                        }

                        oCellName.innerHTML = cellNameHTML;

                        // second <td> - name, basket props, sku props
                        oCellItem = newRow.insertCell(-1);
                        cellItemHTML = '';
                        oCellItem.setAttribute('class', 'item');

                        if (arItem['DETAIL_PAGE_URL'].length > 0)
                            cellItemHTML += '<h2 class="bx_ordercart_itemtitle"><a href="' + arItem['DETAIL_PAGE_URL'] + '">' + arItem['NAME'] + '</a></h2>';
                        else
                            cellItemHTML += '<h2 class="bx_ordercart_itemtitle">' + arItem['NAME'] + '</h2>';

                        cellItemHTML += '<div class="bx_ordercart_itemart">';

                        if (bShowPropsColumn)
                        {
                            for (j = 0; j < arItem['PROPS'].length; j++)
                            {
                                val = arItem['PROPS'][j];

                                if (arItem.SKU_DATA)
                                {
                                    bSkip = false;
                                    for (propId in arItem.SKU_DATA)
                                    {
                                        if (arItem.SKU_DATA.hasOwnProperty(propId))
                                        {
                                            arProp = arItem.SKU_DATA[propId];

                                            if (arProp['CODE'] === val['CODE'])
                                            {
                                                bSkip = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (bSkip)
                                        continue;
                                }

                                cellItemHTML += BX.util.htmlspecialchars(val['NAME']) + ':&nbsp;<span>' + val['VALUE'] + '</span><br/>';
                            }
                        }
                        cellItemHTML += '</div>';

                        if (arItem.SKU_DATA)
                        {
                            propsMap = {};
                            for (k = 0; k < arItem['PROPS'].length; k++)
                            {
                                arItemProp = arItem['PROPS'][k];
                                propsMap[arItemProp['CODE']] = arItemProp['VALUE'];
                            }
                            for (propId in arItem.SKU_DATA)
                            {
                                if (arItem.SKU_DATA.hasOwnProperty(propId))
                                {
                                    selectedIndex = 0;
                                    arProp = arItem.SKU_DATA[propId];
                                    bIsImageProperty = false;
                                    full = (BX.util.array_keys(arProp['VALUES']).length > 5) ? 'full' : '';

                                    counter = 0;
                                    for (valId in arProp['VALUES'])
                                    {
                                        counter++;
                                        arVal = arProp['VALUES'][valId];
                                        if (BX.type.isNotEmptyString(propsMap[arProp['CODE']]))
                                        {
                                            if (propsMap[arProp['CODE']] == arVal['NAME'] || propsMap[arProp['CODE']] == arVal['XML_ID'])
                                                selectedIndex = counter;
                                        }
                                        if (!!arVal && typeof arVal === 'object' && !!arVal['PICT'])
                                        {
                                            bIsImageProperty = true;
                                        }
                                    }

                                    marginLeft = '0';
                                    if (full != '' && selectedIndex > 5)
                                        marginLeft = ((5 - selectedIndex) * 20) + '%';
                                    // sku property can contain list of images or values
                                    if (bIsImageProperty)
                                    {
                                        cellItemHTML += '<div class="bx_item_detail_scu_small_noadaptive ' + full + '">';
                                        cellItemHTML += '<span class="bx_item_section_name_gray">' + BX.util.htmlspecialchars(arProp['NAME']) + '</span>';
                                        cellItemHTML += '<div class="bx_scu_scroller_container">';
                                        cellItemHTML += '<div class="bx_scu">';

                                        cellItemHTML += '<ul id="prop_' + arProp['CODE'] + '_' + arItem['ID'] + '" style="width: 200%; margin-left: ' + marginLeft + ';" class="sku_prop_list">';

                                        counter = 0;
                                        for (valueId in arProp['VALUES'])
                                        {
                                            counter++;
                                            arSkuValue = arProp['VALUES'][valueId];
                                            selected = (selectedIndex == counter ? ' bx_active' : '');

                                            cellItemHTML += '<li style="width:10%;"\
                                            class="sku_prop' + selected + '" \
                                            data-sku-selector="Y" \
                                            data-value-id="' + arSkuValue['XML_ID'] + '" \
                                            data-sku-name="' + arSkuValue['NAME'] + '" \
                                            data-element="' + arItem['ID'] + '" \
                                            data-property="' + arProp['CODE'] + '"\
                                            >\
                                            <a href="javascript:void(0)" class="cnt"><span class="cnt_item" style="background-image:url(' + arSkuValue['PICT']['SRC'] + '"></span></a>\
                                            </li>';
                                        }

                                        cellItemHTML += '</ul>';
                                        cellItemHTML += '</div>';

                                        cellItemHTML += '<div class="bx_slide_left" onclick="leftScroll(\'' + arProp['CODE'] + '\', ' + arItem['ID'] + ', ' + BX.util.array_keys(arProp['VALUES']).length + ');"></div>';
                                        cellItemHTML += '<div class="bx_slide_right" onclick="rightScroll(\'' + arProp['CODE'] + '\', ' + arItem['ID'] + ', ' + BX.util.array_keys(arProp['VALUES']).length + ');"></div>';

                                        cellItemHTML += '</div>';
                                        cellItemHTML += '</div>';
                                    } else // not image
                                    {
                                        cellItemHTML += '<div class="bx_item_detail_size_small_noadaptive ' + full + '">';
                                        cellItemHTML += '<span class="bx_item_section_name_gray">' + BX.util.htmlspecialchars(arProp['NAME']) + '</span>';
                                        cellItemHTML += '<div class="bx_size_scroller_container">';
                                        cellItemHTML += '<div class="bx_size">';

                                        cellItemHTML += '<ul id="prop_' + arProp['CODE'] + '_' + arItem['ID'] + '" style="width: 200%; margin-left: ' + marginLeft + ';" class="sku_prop_list">';

                                        counter = 0;
                                        for (valueId in arProp['VALUES'])
                                        {
                                            counter++;
                                            arSkuValue = arProp['VALUES'][valueId];
                                            selected = (selectedIndex == counter ? ' bx_active' : '');

                                            cellItemHTML += '<li style="width:10%;"\
                                            class="sku_prop ' + selected + '" \
                                            data-sku-selector="Y" \
                                            data-value-id="' + arSkuValue['NAME'] + '" \
                                            data-sku-name="' + arSkuValue['NAME'] + '" \
                                            data-element="' + arItem['ID'] + '" \
                                            data-property="' + arProp['CODE'] + '" \
                                            >\
                                            <a href="javascript:void(0)" class="cnt">' + arSkuValue['NAME'] + '</a>\
                                            </li>';
                                        }

                                        cellItemHTML += '</ul>';
                                        cellItemHTML += '</div>';

                                        cellItemHTML += '<div class="bx_slide_left" onclick="leftScroll(\'' + arProp['CODE'] + '\', ' + arItem['ID'] + ', ' + BX.util.array_keys(arProp['VALUES']).length + ');"></div>';
                                        cellItemHTML += '<div class="bx_slide_right" onclick="rightScroll(\'' + arProp['CODE'] + '\', ' + arItem['ID'] + ', ' + BX.util.array_keys(arProp['VALUES']).length + ');"></div>';

                                        cellItemHTML += '</div>';
                                        cellItemHTML += '</div>';
                                    }
                                }
                            }
                        }

                        oCellItem.innerHTML = cellItemHTML;
                        break;
                        case 'QUANTITY':
                        oCellQuantity = newRow.insertCell(-1);
                        oCellQuantityHTML = '';
                        ratio = (parseFloat(arItem['MEASURE_RATIO']) > 0) ? arItem['MEASURE_RATIO'] : 1;

                        isUpdateQuantity = false;

                        if (ratio != 0 && ratio != '')
                        {
                            oldQuantity = arItem['QUANTITY'];
                            arItem['QUANTITY'] = getCorrectRatioQuantity(arItem['QUANTITY'], ratio, bUseFloatQuantity);

                            if (oldQuantity != arItem['QUANTITY'])
                            {
                                isUpdateQuantity = true;
                            }
                        }

                        oCellQuantity.setAttribute('class', 'custom');
                        oCellQuantityHTML += '<span>' + getColumnName(res, arColumns[i]) + ':</span>';

                        oCellQuantityHTML += '<div class="centered">';
                        oCellQuantityHTML += '<table cellspacing="0" cellpadding="0" class="counter">';
                        oCellQuantityHTML += '<tr>';
                        oCellQuantityHTML += '<td>';

                        oCellQuantityHTML += '<input type="text" size="3" id="QUANTITY_INPUT_' + arItem['ID'] + '"\
                        name="QUANTITY_INPUT_' + arItem['ID'] + '"\
                        style="max-width: 50px"\
                        value="' + arItem['QUANTITY'] + '"\
                        onchange="updateQuantity(\'QUANTITY_INPUT_' + arItem['ID'] + '\',\'' + arItem['ID'] + '\', ' + ratio + ',' + bUseFloatQuantity + ')"\
                        >';

                        oCellQuantityHTML += '</td>';

                        if (ratio != 0
                            && ratio != ''
                                ) // if not Set parent, show quantity control
                        {
                            oCellQuantityHTML += '<td id="basket_quantity_control">\
                            <div class="basket_quantity_control">\
                            <a href="javascript:void(0);" class="plus" onclick="setQuantity(' + arItem['ID'] + ', ' + ratio + ', \'up\', ' + bUseFloatQuantity + ');"></a>\
                            <a href="javascript:void(0);" class="minus" onclick="setQuantity(' + arItem['ID'] + ', ' + ratio + ', \'down\', ' + bUseFloatQuantity + ');"></a>\
                            </div>\
                            </td>';
                        }

                        if (arItem.hasOwnProperty('MEASURE_TEXT') && arItem['MEASURE_TEXT'].length > 0)
                            oCellQuantityHTML += '<td style="text-align: left">' + BX.util.htmlspecialchars(arItem['MEASURE_TEXT']) + '</td>';

                        oCellQuantityHTML += '</tr>';
                        oCellQuantityHTML += '</table>';
                        oCellQuantityHTML += '</div>';

                        oCellQuantityHTML += '<input type="hidden" id="QUANTITY_' + arItem['ID'] + '" name="QUANTITY_' + arItem['ID'] + '" value="' + arItem['QUANTITY'] + '" />';

                        oCellQuantity.innerHTML = oCellQuantityHTML;

                        if (isUpdateQuantity)
                        {
                            updateQuantity('QUANTITY_INPUT_' + arItem['ID'], arItem['ID'], ratio, bUseFloatQuantity);
                        }
                        break;
                        case 'PRICE':
                        oCellPrice = newRow.insertCell(-1);
                        fullPrice = (arItem['DISCOUNT_PRICE_PERCENT'] > 0) ? arItem['FULL_PRICE_FORMATED'] : '';

                        oCellPrice.setAttribute('class', 'price');
                        oCellPrice.innerHTML = '<div class="current_price" id="current_price_' + arItem['ID'] + '">' + arItem['PRICE_FORMATED'] + '</div>' +
                        '<div class="old_price" id="old_price_' + arItem['ID'] + '">' + fullPrice + '</div>';

                        if (bShowPriceType && arItem['NOTES'].length > 0)
                        {
                            oCellPrice.innerHTML += '<div class="type_price">' + basketJSParams['SALE_TYPE'] + '</div>';
                            oCellPrice.innerHTML += '<div class="type_price_value">' + arItem['NOTES'] + '</div>';
                        }
                        break;
                        case 'DISCOUNT':
                        oCellDiscount = newRow.insertCell(-1);
                        oCellDiscount.setAttribute('class', 'custom');
                        oCellDiscount.innerHTML = '<span>' + getColumnName(res, arColumns[i]) + ':</span>';
                        oCellDiscount.innerHTML += '<div id="discount_value_' + arItem['ID'] + '">' + arItem['DISCOUNT_PRICE_PERCENT_FORMATED'] + '</div>';
                        break;
                        case 'WEIGHT':
                        oCellWeight = newRow.insertCell(-1);
                        oCellWeight.setAttribute('class', 'custom');
                        oCellWeight.innerHTML = '<span>' + getColumnName(res, arColumns[i]) + ':</span>';
                        oCellWeight.innerHTML += arItem['WEIGHT_FORMATED'];
                        break;
                        default:
                        oCellCustom = newRow.insertCell(-1);
                        customColumnVal = '';

                        oCellCustom.setAttribute('class', 'custom');
                        oCellCustom.innerHTML = '<span>' + getColumnName(res, arColumns[i]) + ':</span>';

                        if (arColumns[i] == 'SUM')
                            customColumnVal += '<div id="sum_' + arItem['ID'] + '">';

                        if (typeof (arItem[arColumns[i]]) != 'undefined')
                        {
                            customColumnVal += arItem[arColumns[i]];
                        }

                        if (arColumns[i] == 'SUM')
                            customColumnVal += '</div>';

                        oCellCustom.innerHTML += customColumnVal;
                        break;
                    }
                }

                if (bShowDeleteColumn || bShowDelayColumn)
                {
                    var oCellControl = newRow.insertCell(-1);
                    oCellControl.setAttribute('class', 'control');

                    if (bShowDeleteColumn)
                        oCellControl.innerHTML = '<a href="' + basketJSParams['DELETE_URL'].replace('#ID#', arItem['ID']) + '">' + basketJSParams['SALE_DELETE'] + '</a><br />';

                    if (bShowDelayColumn)
                        oCellControl.innerHTML += '<a href="' + basketJSParams['DELAY_URL'].replace('#ID#', arItem['ID']) + '">' + basketJSParams['SALE_DELAY'] + '</a>';
                }

                var oCellMargin2 = newRow.insertCell(-1);
                oCellMargin2.setAttribute('class', 'margin');
            }
        }

    // update product params after recalculation
    if (!!res.BASKET_DATA)
    {
        for (id in res.BASKET_DATA.GRID.ROWS)
        {
            if (res.BASKET_DATA.GRID.ROWS.hasOwnProperty(id))
            {
                var item = res.BASKET_DATA.GRID.ROWS[id];

                if (BX('discount_value_' + id))
                    BX('discount_value_' + id).innerHTML = item.DISCOUNT_PRICE_PERCENT_FORMATED;

                if (BX('current_price_' + id))
                    BX('current_price_' + id).innerHTML = item.PRICE_FORMATED;

                if (BX('old_price_' + id))
                    BX('old_price_' + id).innerHTML = (item.DISCOUNT_PRICE_PERCENT > 0) ? item.FULL_PRICE_FORMATED : '';

                if (BX('sum_' + id))
                    BX('sum_' + id).innerHTML = item.SUM;

                // if the quantity was set by user to 0 or was too much, we need to show corrected quantity value from ajax response
                if (BX('QUANTITY_' + id))
                {
                    BX('QUANTITY_INPUT_' + id).value = item.QUANTITY;
                    BX('QUANTITY_INPUT_' + id).defaultValue = item.QUANTITY;

                    BX('QUANTITY_' + id).value = item.QUANTITY;
                }
            }
        }
    }

    // update coupon info
    if (!!res.BASKET_DATA)
        couponListUpdate(res.BASKET_DATA);

    // update warnings if any
    if (res.hasOwnProperty('WARNING_MESSAGE'))
    {
        var warningText = '';

        for (i = res['WARNING_MESSAGE'].length - 1; i >= 0; i--)
            warningText += res['WARNING_MESSAGE'][i] + '<br/>';

        BX('warning_message').innerHTML = warningText;
    }

    // update total basket values
    if (!!res.BASKET_DATA)
    {
        if (BX('allWeight_FORMATED'))
            BX('allWeight_FORMATED').innerHTML = res['BASKET_DATA']['allWeight_FORMATED'].replace(/\s/g, '&nbsp;');

        if (BX('allSum_wVAT_FORMATED'))
            BX('allSum_wVAT_FORMATED').innerHTML = res['BASKET_DATA']['allSum_wVAT_FORMATED'].replace(/\s/g, '&nbsp;');

        if (BX('allVATSum_FORMATED'))
            BX('allVATSum_FORMATED').innerHTML = res['BASKET_DATA']['allVATSum_FORMATED'].replace(/\s/g, '&nbsp;');

        if (BX('allSum_FORMATED'))
            BX('allSum_FORMATED').innerHTML = res['BASKET_DATA']['allSum_FORMATED'].replace(/\s/g, '&nbsp;');

        if (BX('PRICE_WITHOUT_DISCOUNT'))
        {
            var showPriceWithoutDiscount = (res['BASKET_DATA']['PRICE_WITHOUT_DISCOUNT'] != res['BASKET_DATA']['allSum_FORMATED']);
            BX('PRICE_WITHOUT_DISCOUNT').innerHTML = showPriceWithoutDiscount ? res['BASKET_DATA']['PRICE_WITHOUT_DISCOUNT'].replace(/\s/g, '&nbsp;') : '';
            BX.style(BX('PRICE_WITHOUT_DISCOUNT').parentNode, 'display', (showPriceWithoutDiscount ? 'table-row' : 'none'));
        }

        BX.onCustomEvent('OnBasketChange');
    }
}
/**
 * @param couponBlock
 * @param {COUPON: string, JS_STATUS: string} oneCoupon - new coupon.
 */
 function couponCreate(couponBlock, oneCoupon)
 {
    var couponClass = 'disabled';

    if (!BX.type.isElementNode(couponBlock))
        return;
    if (oneCoupon.JS_STATUS === 'BAD')
        couponClass = 'bad';
    else if (oneCoupon.JS_STATUS === 'APPLYED')
        couponClass = 'good';

    couponBlock.appendChild(BX.create(
        'div',
        {
            props: {
                className: 'bx_ordercart_coupon'
            },
            children: [
            BX.create(
                'input',
                {
                    props: {
                        className: couponClass,
                        type: 'text',
                        value: oneCoupon.COUPON,
                        name: 'OLD_COUPON[]'
                    },
                    attrs: {
                        disabled: true,
                        readonly: true
                    }
                }
                ),
            BX.create(
                'span',
                {
                    props: {
                        className: couponClass
                    },
                    attrs: {
                        'data-coupon': oneCoupon.COUPON
                    }
                }
                ),
            BX.create(
                'div',
                {
                    props: {
                        className: 'bx_ordercart_coupon_notes'
                    },
                    html: oneCoupon.JS_CHECK_CODE
                }
                )
            ]
        }
        ));
}

/**
 * @param {COUPON_LIST : []} res
 */
 function couponListUpdate(res)
 {
    var couponBlock,
    couponClass,
    fieldCoupon,
    couponsCollection,
    couponFound,
    i,
    j,
    key;

    if (!!res && typeof res !== 'object')
    {
        return;
    }

    couponBlock = BX('coupons_block');
    if (!!couponBlock)
    {
        if (!!res.COUPON_LIST && BX.type.isArray(res.COUPON_LIST))
        {
            fieldCoupon = BX('coupon');
            if (!!fieldCoupon)
            {
                fieldCoupon.value = '';
            }
            couponsCollection = BX.findChildren(couponBlock, {tagName: 'input', property: {name: 'OLD_COUPON[]'}}, true);

            if (!!couponsCollection)
            {
                if (BX.type.isElementNode(couponsCollection))
                {
                    couponsCollection = [couponsCollection];
                }
                for (i = 0; i < res.COUPON_LIST.length; i++)
                {
                    couponFound = false;
                    key = -1;
                    for (j = 0; j < couponsCollection.length; j++)
                    {
                        if (couponsCollection[j].value === res.COUPON_LIST[i].COUPON)
                        {
                            couponFound = true;
                            key = j;
                            couponsCollection[j].couponUpdate = true;
                            break;
                        }
                    }
                    if (couponFound)
                    {
                        couponClass = 'disabled';
                        if (res.COUPON_LIST[i].JS_STATUS === 'BAD')
                            couponClass = 'bad';
                        else if (res.COUPON_LIST[i].JS_STATUS === 'APPLYED')
                            couponClass = 'good';

                        BX.adjust(couponsCollection[key], {props: {className: couponClass}});
                        BX.adjust(couponsCollection[key].nextSibling, {props: {className: couponClass}});
                        BX.adjust(couponsCollection[key].nextSibling.nextSibling, {html: res.COUPON_LIST[i].JS_CHECK_CODE});
                    } else
                    {
                        couponCreate(couponBlock, res.COUPON_LIST[i]);
                    }
                }
                for (j = 0; j < couponsCollection.length; j++)
                {
                    if (typeof (couponsCollection[j].couponUpdate) === 'undefined' || !couponsCollection[j].couponUpdate)
                    {
                        BX.remove(couponsCollection[j].parentNode);
                        couponsCollection[j] = null;
                    } else
                    {
                        couponsCollection[j].couponUpdate = null;
                    }
                }
            } else
            {
                for (i = 0; i < res.COUPON_LIST.length; i++)
                {
                    couponCreate(couponBlock, res.COUPON_LIST[i]);
                }
            }
        }
    }
    couponBlock = null;
}

function skuPropClickHandler()
{
    var target = this,
    basketItemId,
    property,
    property_values = {},
    postData = {},
    action_var,
    all_sku_props,
    i,
    sku_prop_value,
    m;

    if (!!target && target.hasAttribute('data-value-id'))
    {
        BX.showWait();

        basketItemId = target.getAttribute('data-element');
        property = target.getAttribute('data-property');
        action_var = BX('action_var').value;

        property_values[property] = BX.util.htmlspecialcharsback(target.getAttribute('data-value-id'));

        // if already selected element is clicked
        if (BX.hasClass(target, 'bx_active'))
        {
            BX.closeWait();
            return;
        }

        // get other basket item props to get full unique set of props of the new product
        all_sku_props = BX.findChildren(BX(basketItemId), {tagName: 'ul', className: 'sku_prop_list'}, true);
        if (!!all_sku_props && all_sku_props.length > 0)
        {
            for (i = 0; all_sku_props.length > i; i++)
            {
                if (all_sku_props[i].id !== 'prop_' + property + '_' + basketItemId)
                {
                    sku_prop_value = BX.findChildren(BX(all_sku_props[i].id), {tagName: 'li', className: 'bx_active'}, true);
                    if (!!sku_prop_value && sku_prop_value.length > 0)
                    {
                        for (m = 0; sku_prop_value.length > m; m++)
                        {
                            if (sku_prop_value[m].hasAttribute('data-value-id'))
                            {
                                property_values[sku_prop_value[m].getAttribute('data-property')] = BX.util.htmlspecialcharsback(sku_prop_value[m].getAttribute('data-value-id'));
                            }
                        }
                    }
                }
            }
        }

        postData = {
            'basketItemId': basketItemId,
            'sessid': BX.bitrix_sessid(),
            'site_id': BX.message('SITE_ID'),
            'props': property_values,
            'action_var': action_var,
            'select_props': BX('column_headers').value,
            'offers_props': BX('offers_props').value,
            'quantity_float': BX('quantity_float').value,
            'price_vat_show_value': BX('price_vat_show_value').value,
            'hide_coupon': BX('hide_coupon').value,
            'use_prepayment': BX('use_prepayment').value
        };

        postData[action_var] = 'select_item';

        BX.ajax({
            url: '/bitrix/components/bitrix/sale.basket.basket/ajax.php',
            method: 'POST',
            data: postData,
            dataType: 'json',
            onsuccess: function (result)
            {
                BX.closeWait();
                updateBasketTable(basketItemId, result);
            }
        });
    }
}

function getColumnName(result, columnCode)
{
    if (BX('col_' + columnCode))
    {
        return BX.util.trim(BX('col_' + columnCode).innerHTML);
    } else
    {
        return '';
    }
}

function leftScroll(prop, id, count)
{
    count = parseInt(count, 10);
    var el = BX('prop_' + prop + '_' + id);

    if (el)
    {
        var curVal = parseInt(el.style.marginLeft, 10);
        if (curVal <= -20)
            el.style.marginLeft = curVal + 20 + '%';
    }
}

function rightScroll(prop, id, count)
{
    count = parseInt(count, 10);
    var el = BX('prop_' + prop + '_' + id);

    if (el)
    {
        var curVal = parseInt(el.style.marginLeft, 10);
        if (curVal > (5 - count) * 20)
            el.style.marginLeft = curVal - 20 + '%';
    }
}

function checkOut()
{
    if (!!BX('coupon'))
        BX('coupon').disabled = true;
    BX("basket_form").submit();
    return true;
}

function updateBasket()
{
    recalcBasketAjax({});
}

function enterCoupon()
{
    var newCoupon = BX('coupon');
    if (!!newCoupon && !!newCoupon.value)
        recalcBasketAjax({'coupon': newCoupon.value});
}

// check if quantity is valid
// and update values of both controls (text input field for PC and mobile quantity select) simultaneously
function updateQuantity(controlId, basketId, ratio, bUseFloatQuantity)
{
    var oldVal = BX(controlId).defaultValue,
    newVal = parseFloat(BX(controlId).value) || 0,
    bIsCorrectQuantityForRatio = false,
    autoCalculate = ((BX("auto_calculation") && BX("auto_calculation").value == "Y") || !BX("auto_calculation"));

    if (ratio === 0 || ratio == 1)
    {
        bIsCorrectQuantityForRatio = true;
    } else
    {

        var newValInt = newVal * 10000,
        ratioInt = ratio * 10000,
        reminder = newValInt % ratioInt,
        newValRound = parseInt(newVal);

        if (reminder === 0)
        {
            bIsCorrectQuantityForRatio = true;
        }
    }

    var bIsQuantityFloat = false;

    if (parseInt(newVal) != parseFloat(newVal))
    {
        bIsQuantityFloat = true;
    }

    newVal = (bUseFloatQuantity === false && bIsQuantityFloat === false) ? parseInt(newVal) : parseFloat(newVal).toFixed(4);
    newVal = correctQuantity(newVal);

    if (bIsCorrectQuantityForRatio)
    {
        BX(controlId).defaultValue = newVal;

        BX("QUANTITY_INPUT_" + basketId).value = newVal;

        // set hidden real quantity value (will be used in actual calculation)
        BX("QUANTITY_" + basketId).value = newVal;

        if (autoCalculate)
        {
            basketPoolQuantity.changeQuantity(basketId);
        }
    } else
    {
        newVal = getCorrectRatioQuantity(newVal, ratio, bUseFloatQuantity);
        newVal = correctQuantity(newVal);

        if (newVal != oldVal)
        {
            BX("QUANTITY_INPUT_" + basketId).value = newVal;
            BX("QUANTITY_" + basketId).value = newVal;

            if (autoCalculate)
            {
                basketPoolQuantity.changeQuantity(basketId);
            }
        } else
        {
            BX(controlId).value = oldVal;
        }
    }
}

// used when quantity is changed by clicking on arrows
function setQuantity(basketId, ratio, sign, bUseFloatQuantity)
{
    var curVal = parseFloat(BX("QUANTITY_INPUT_" + basketId).value),
    newVal;

    newVal = (sign == 'up') ? curVal + ratio : curVal - ratio;

    if (newVal < 0)
        newVal = 0;

    if (bUseFloatQuantity)
    {
        newVal = parseFloat(newVal).toFixed(4);
    }
    newVal = correctQuantity(newVal);

    if (ratio > 0 && newVal < ratio)
    {
        newVal = ratio;
    }

    if (!bUseFloatQuantity && newVal != newVal.toFixed(4))
    {
        newVal = parseFloat(newVal).toFixed(4);
    }

    newVal = getCorrectRatioQuantity(newVal, ratio, bUseFloatQuantity);
    newVal = correctQuantity(newVal);

    BX("QUANTITY_INPUT_" + basketId).value = newVal;
    BX("QUANTITY_INPUT_" + basketId).defaultValue = newVal;

    updateQuantity('QUANTITY_INPUT_' + basketId, basketId, ratio, bUseFloatQuantity);
}

function getCorrectRatioQuantity(quantity, ratio, bUseFloatQuantity)
{
    var newValInt = quantity * 10000,
    ratioInt = ratio * 10000,
    reminder = (quantity / ratio - ((quantity / ratio).toFixed(0))).toFixed(6),
    result = quantity,
    bIsQuantityFloat = false,
    i;
    ratio = parseFloat(ratio);

    if (reminder == 0)
    {
        return result;
    }

    if (ratio !== 0 && ratio != 1)
    {
        for (i = ratio, max = parseFloat(quantity) + parseFloat(ratio); i <= max; i = parseFloat(parseFloat(i) + parseFloat(ratio)).toFixed(4))
        {
            result = i;
        }

    } else if (ratio === 1)
    {
        result = quantity | 0;
    }

    if (parseInt(result, 10) != parseFloat(result))
    {
        bIsQuantityFloat = true;
    }

    result = (bUseFloatQuantity === false && bIsQuantityFloat === false) ? parseInt(result, 10) : parseFloat(result).toFixed(4);
    result = correctQuantity(result);
    return result;
}

function correctQuantity(quantity)
{
    return parseFloat((quantity * 1).toString());
}


/**
 *
 * @param {} params
 */
 function recalcBasketAjax(params)
 {
    if (basketPoolQuantity.isProcessing())
    {
        return false;
    }

    BX.showWait();

    var property_values = {},
    action_var = BX('action_var').value,
    items = BX('basket_items'),
    delayedItems = BX('delayed_items'),
    postData,
    i;

    postData = {
        'sessid': BX.bitrix_sessid(),
        'site_id': BX.message('SITE_ID'),
        'props': property_values,
        'action_var': action_var,
        'select_props': BX('column_headers').value,
        'offers_props': BX('offers_props').value,
        'quantity_float': BX('quantity_float').value,
        'price_vat_show_value': BX('price_vat_show_value').value,
        'hide_coupon': BX('hide_coupon').value,
        'use_prepayment': BX('use_prepayment').value
    };
    postData[action_var] = 'recalculate';
    if (!!params && typeof params === 'object')
    {
        for (i in params)
        {
            if (params.hasOwnProperty(i))
                postData[i] = params[i];
        }
    }

    if (!!items && items.rows.length > 0)
    {
        for (i = 1; items.rows.length > i; i++)
            postData['QUANTITY_' + items.rows[i].id] = BX('QUANTITY_' + items.rows[i].id).value;
    }

    if (!!delayedItems && delayedItems.rows.length > 0)
    {
        for (i = 1; delayedItems.rows.length > i; i++)
            postData['DELAY_' + delayedItems.rows[i].id] = 'Y';
    }

    basketPoolQuantity.setProcessing(true);
    basketPoolQuantity.clearPool();

    BX.ajax({
        url: '/bitrix/components/bitrix/sale.basket.basket/ajax.php',
        method: 'POST',
        data: postData,
        dataType: 'json',
        onsuccess: function (result)
        {
            BX.closeWait();
            basketPoolQuantity.setProcessing(false);

            if (params.coupon)
            {
                //hello, gifts!
                if (!!result && !!result.BASKET_DATA && !!result.BASKET_DATA.NEED_TO_RELOAD_FOR_GETTING_GIFTS)
                {
                    BX.reload();
                }
            }

            if (basketPoolQuantity.isPoolEmpty())
            {
                updateBasketTable(null, result);
                basketPoolQuantity.updateQuantity();
            } else
            {
                basketPoolQuantity.enableTimer(true);
            }
        }
    });
}

function showBasketItemsList(val)
{
    BX.removeClass(BX("basket_toolbar_button"), "current");
    BX.removeClass(BX("basket_toolbar_button_delayed"), "current");
    BX.removeClass(BX("basket_toolbar_button_subscribed"), "current");
    BX.removeClass(BX("basket_toolbar_button_not_available"), "current");

    BX("normal_count").style.display = 'inline-block';
    BX("delay_count").style.display = 'inline-block';
    BX("subscribe_count").style.display = 'inline-block';
    BX("not_available_count").style.display = 'inline-block';

    if (val == 2)
    {
        if (BX("basket_items_list"))
            BX("basket_items_list").style.display = 'none';
        if (BX("basket_items_delayed"))
        {
            BX("basket_items_delayed").style.display = 'block';
            BX.addClass(BX("basket_toolbar_button_delayed"), "current");
            BX("delay_count").style.display = 'none';
        }
        if (BX("basket_items_subscribed"))
            BX("basket_items_subscribed").style.display = 'none';
        if (BX("basket_items_not_available"))
            BX("basket_items_not_available").style.display = 'none';
    } else if (val == 3)
    {
        if (BX("basket_items_list"))
            BX("basket_items_list").style.display = 'none';
        if (BX("basket_items_delayed"))
            BX("basket_items_delayed").style.display = 'none';
        if (BX("basket_items_subscribed"))
        {
            BX("basket_items_subscribed").style.display = 'block';
            BX.addClass(BX("basket_toolbar_button_subscribed"), "current");
            BX("subscribe_count").style.display = 'none';
        }
        if (BX("basket_items_not_available"))
            BX("basket_items_not_available").style.display = 'none';
    } else if (val == 4)
    {
        if (BX("basket_items_list"))
            BX("basket_items_list").style.display = 'none';
        if (BX("basket_items_delayed"))
            BX("basket_items_delayed").style.display = 'none';
        if (BX("basket_items_subscribed"))
            BX("basket_items_subscribed").style.display = 'none';
        if (BX("basket_items_not_available"))
        {
            BX("basket_items_not_available").style.display = 'block';
            BX.addClass(BX("basket_toolbar_button_not_available"), "current");
            BX("not_available_count").style.display = 'none';
        }
    } else
    {
        if (BX("basket_items_list"))
        {
            BX("basket_items_list").style.display = 'block';
            BX.addClass(BX("basket_toolbar_button"), "current");
            BX("normal_count").style.display = 'none';
        }
        if (BX("basket_items_delayed"))
            BX("basket_items_delayed").style.display = 'none';
        if (BX("basket_items_subscribed"))
            BX("basket_items_subscribed").style.display = 'none';
        if (BX("basket_items_not_available"))
            BX("basket_items_not_available").style.display = 'none';
    }
}

function deleteCoupon()
{
    var target = this,
    value;

    if (!!target && target.hasAttribute('data-coupon'))
    {
        value = target.getAttribute('data-coupon');
        if (!!value && value.length > 0)
        {
            recalcBasketAjax({'delete_coupon': value});
        }
    }
}

function deleteProductRow(target)
{
    var targetRow = BX.findParent(target, {tagName: 'TR'}),
    quantityNode,
    delItem;

    if (targetRow)
    {
        quantityNode = BX('QUANTITY_' + targetRow.id);
        if (quantityNode)
        {
            delItem = getCurrentItemAnalyticsInfo(targetRow, quantityNode.value);
        }
    }

    setAnalyticsDataLayer([], [delItem]);

    document.location.href = target.href;

    return false;
}

function checkAnalytics(currentQuantity, newItems)
{
    if (!currentQuantity || !newItems || BX.util.array_values(currentQuantity).length === 0)
        return;

    var itemId, diff,
    current = {}, addItems = [], delItems = [],
    i;

    if (!!newItems && newItems.rows.length)
    {
        for (i = 1; newItems.rows.length > i; i++)
        {
            itemId = newItems.rows[i].id;
            diff = BX('QUANTITY_' + itemId).value - currentQuantity[itemId];

            if (diff != 0)
            {
                current = getCurrentItemAnalyticsInfo(newItems.rows[i], diff);

                if (diff > 0)
                {
                    addItems.push(current);
                } else
                {
                    delItems.push(current);
                }
            }
        }
    }

    if (addItems.length || delItems.length)
    {
        setAnalyticsDataLayer(addItems, delItems);
    }
}

function getCurrentItemAnalyticsInfo(row, diff)
{
    if (!row)
        return;

    var temp, k, variants = [];

    var current = {
        'name': row.getAttribute('data-item-name') || '',
        'id': row.id,
        'price': row.getAttribute('data-item-price') || 0,
        'brand': (row.getAttribute('data-item-brand') || '').split(',  ').join('/'),
        'variant': '',
        'quantity': Math.abs(diff)
    };

    temp = row.querySelectorAll('.bx_active[data-sku-name]');
    for (k = 0; k < temp.length; k++)
    {
        variants.push(temp[k].getAttribute('data-sku-name'));
    }

    current.variant = variants.join('/');

    return current;
}

function setAnalyticsDataLayer(addItems, delItems)
{
    window[basketJSParams['DATA_LAYER_NAME']] = window[basketJSParams['DATA_LAYER_NAME']] || [];

    if (addItems && addItems.length)
    {
        window[basketJSParams['DATA_LAYER_NAME']].push({
            'event': 'addToCart',
            'ecommerce': {
                'currencyCode': getCurrencyCode(),
                'add': {
                    'products': addItems
                }
            }
        });
    }

    if (delItems && delItems.length)
    {
        window[basketJSParams['DATA_LAYER_NAME']].push({
            'event': 'removeFromCart',
            'ecommerce': {
                'currencyCode': getCurrencyCode(),
                'remove': {
                    'products': delItems
                }
            }
        });
    }
}

function getCurrencyCode()
{
    var root = BX('basket_items'),
    node,
    currency = '';

    if (root)
    {
        node = root.querySelector('[data-item-currency');
        node && (currency = node.getAttribute('data-item-currency'));
    }

    return currency;


}

BX.ready(function () {

    basketPoolQuantity = new BasketPoolQuantity();
    var couponBlock = BX('coupons_block'),
    basketItems = BX('basket_items');

    if (BX.type.isElementNode(couponBlock))
        BX.bindDelegate(couponBlock, 'click', {'attribute': 'data-coupon'}, deleteCoupon);

    if (BX.type.isElementNode(basketItems))
        BX.bindDelegate(basketItems, 'click', {tagName: 'li', 'attr': {'data-sku-selector': 'Y'}}, skuPropClickHandler);

    if (BX.type.isNotEmptyString(basketJSParams['EVENT_ONCHANGE_ON_START']) && basketJSParams['EVENT_ONCHANGE_ON_START'] == "Y")
        BX.onCustomEvent('OnBasketChange');

    if($('.basketTableProduct__item').length) {
        $('.basketTableProduct__item').each(function() {
            calculateItemTotal($(this));
        })
        calculateTotal();
        removeZeros();
        showBlankLink();
    }
    if($('.basketItem__infoAdditional').length) {
        $('.basketItem__infoAdditional').each(function() {
            $(this).find('.basketItem__price').text(formatPrice($(this).data('price')))
        });
        removeZeros();
    }
    /*print saved basket form data*/
    if(localStorage.getItem('basketFormData')) {
        var basketSavedData = JSON.parse(localStorage.getItem('basketFormData'));
        $('.basketTableBuyer input, .basketTableBuyer textarea').each(function() {
            if(basketSavedData.hasOwnProperty($(this).attr('name'))) {
                if($(this).attr('type') != "radio" && $(this).attr('type') != "checkbox" && $(this).attr('type') != "hidden") {
                    $(this).val(basketSavedData[$(this).attr('name')]);
                }
                if($(this).attr('type') == "radio" && $(this).val() == basketSavedData[$(this).attr('name')]) {
                    $(this).prop('checked', 'checked');
                    $(this).siblings('.inputImitation').addClass('checked');
                }
            }
        });
        $('.basketTableBuyer input').trigger('blur');
    }
    /*save basket form data*/
    $('.basketTableBuyer input, .basketTableBuyer textarea').on('change', function() {
        var basketFormData = {};
        $('.basketTableBuyer input, .basketTableBuyer textarea').each(function() {
            if($(this).attr('type') != "radio" && $(this).attr('type') != "checkbox" && $(this).attr('type') != "hidden") {
                basketFormData[$(this).attr('name')] = $(this).val();
            }
            if($(this).attr('type') == "radio") {
                if($(this).prop('checked') == true) {
                    basketFormData[$(this).attr('name')] = $(this).val();
                    basketFormData[$(this).siblings('[type="hidden"]').attr('name')] = $(this).siblings('[type="hidden"]').val();
                }
            }

        });
        localStorage.setItem('basketFormData', JSON.stringify(basketFormData));
    })

    $('.js_itemQuantity').on('change', function() {
        var pattern = /\d/;
        if(!pattern.test($(this).val()) || $(this).val() < 1) {
            $(this).val(1);
        }
        if($(this).val() > 99) {
            $(this).val(99);
        }
        calculateTotal();
        removeZeros();
        var itemQuantity = new FormData();
        itemQuantity.append('item_id', $(this).parents('.basketTableProduct__item').find('[name="item_id"]').val());
        itemQuantity.append('item_quantity', $(this).val());
        sendBasketData(itemQuantity, false);
    })

    $('.js_removeItem').on('click', function() {
        var itemToDelete = new FormData();
        itemToDelete.append('delete_item_id', $(this).parents('.basketTableProduct__item').find('[name="item_id"]').val());
        sendBasketData(itemToDelete, '/cart/');
        removeFromBasket($(this).parents('.basketTableProduct__item'));
    })
    $('.js_removeAdditional').on('click', function() {
        // $(this).parent().append('<input type="hidden" name="'+$(this).data('code')+'" value="'+$(this).data('baza')+'">');
        var standardItem = new FormData();
        standardItem.append('item_id', $(this).parents('.basketTableProduct__item').find('[name="item_id"]').val());
        standardItem.append('komponent_code', $(this).data('code'));
        standardItem.append('komponent_baza', $(this).data('baza'));

        sendBasketData(standardItem, '/cart/');
        removeFromBasket($(this).parents('.basketItem__infoAdditional'));
    })
    /**scroll to anchor**/
    $(".basketAside__link a").on("click", function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $(".basketTableBuyer").offset().top}, 300)
    })
    /**insert text**/
    $('.js_basket').on('click', function() {
        var textToAdd = ($(this).data('delivery') == "assembled" ? 'В собранном виде.' : 'В разобранном виде.')
        var inputText = $('#client_message_basket').val();
        if(!$(this).hasClass('js_selected')) {
            $(this).siblings().removeClass('js_selected').addClass('linkType1');
            $(this).addClass('js_selected').removeClass('linkType1');
            if(inputText.indexOf('обранном виде.') > -1) {
                if($(this).data('delivery') == "assembled") {
                    inputText = inputText.slice(0, inputText.indexOf('обранном виде.')-5).trim();
                } else {
                    inputText = inputText.slice(0, inputText.indexOf('обранном виде.')-3).trim();
                }
            } 
            $('#client_message_basket').val(inputText+' '+textToAdd).trigger('change');
        };
    });
    $('#client_message_basket').on('keyup', function() {
        if($(this).val().indexOf('обранном виде.') == -1) {
            $('.js_basket').removeClass('js_selected').addClass('linkType1');
        }
    });

});

/*VALIDATION*/
if($('input[data-valid="phone"]').length) {
    $('input[data-valid="phone"]').mask("+375 (99) 999-99-99", {autoclear: false});
}

function Validator() {
    var params = [
    'js_validate',
    'data-valid',
    'data-valid-min',
    'js_class_valid',
    'js_invalid_animate',
    'error',
    'ok'
    ],
    forms = $('.' + params[0]),
    fields = forms.find('[' + params[1] + ']'),
    animate_stopper = true,
    regulars = {
        name: /^[A-Za-zА-Яа-яЁё_-\s]+$/,
        phone: /^(\+375){1}(\s){1}(\(){1}(\d){2}(\)){1}(\s){1}(\d){3}(\-){1}(\d){2}(\-){1}(\d){2}$/,
        email: /^([a-zA-ZА-Яа-яЁё0-9_-]+\.)*[a-zA-ZА-Яа-яЁё0-9_-]+@[a-zA-ZА-Яа-яЁё0-9_-]+(\.[a-zA-ZА-Яа-яЁё0-9_-]+)*\.[a-zA-ZА-Яа-яЁё]{2,6}$/,
        number: /^\d+$/
    };
    var fieldCount = 0;
    function worker(exp, field_wrap) {
        field_wrap.removeClass(params[5]);
        exp ?
        field_wrap.removeClass(params[6]).addClass(params[5]) :
        field_wrap.addClass(params[6]);
    };

    function check_reg(field) {
        var field_wrap, min;

        field.attr(params[2]) ?
        min = (field.val().length < field.attr(params[2])) : min = false;

        field.hasClass(params[3]) ?
        field_wrap = field : field_wrap = field.closest('.' + params[3]);

        switch (field.attr(params[1])) {
            case 'name':
            worker(min || !regulars.name.test(field.val()), field_wrap);
            break;
            case 'phone':
            worker(min || !regulars.phone.test(field.val()), field_wrap);
            break;
            case 'email':
            worker(min || !regulars.email.test(field.val()), field_wrap);
            break;
            case 'number':
            worker(min || !regulars.number.test(field.val()), field_wrap);
            break;
            case 'all':
            worker(min, field_wrap);
            break;
        }

        enableButton();
    };

    function validate_cool(form) {
        var input = form.find('.' + params[3]),
        submit = true;

        input.each(function () {
            if ($(this).hasClass(params[5])) {
                return submit = false;
            }
        });

        if (form.hasClass(params[4]) && animate_stopper) {
            animate_stopper = false;
            input.each(function () {
                if ($(this).hasClass(params[5])) {
                    $(this)
                    .animate({left: "-12px"}, 100).animate({left: "12px"}, 100)
                    .animate({left: "-10px"}, 100).animate({left: "8px"}, 100)
                    .animate({left: "-6px"}, 100).animate({left: "0px"}, 100, function () {
                        animate_stopper = true;
                    });
                }
            });
        };

        return submit;
    };



    fields.on('focus', function () {
        $(this).parent().removeClass("error ok");
    });
    fields.on('keyup', function () {
        if($(this).data("valid") == "name" && $(this).val().length>=2 || $(this).data("valid") == "phone" && parseInt($(this).val().slice(18))>=0 || $(this).data("valid") == "all" && $(this).val().length>=5){
            check_reg($(this));
        }
    });
    $(".js_class_valid .photo_way").on("change", function() {
        check_reg($(this));
    });


    fields.on('change, blur', function () {
        if($(this).val() != "") {
            check_reg($(this)); 
        } else {
            $(this).parent().removeClass("error ok");
        }
        enableButton();
    });

    forms.on('submit', function (e) {
        $(this).find('[' + params[1] + ']').each(function () {
            check_reg($(this));
        });
        return validate_cool($(this));
    })
};
function enableButton() {
    if($(".js_class_valid").length == $(".js_class_valid.ok").length) {
        $('button[type="submit"], button.send_button, input[name="send_form"]').removeClass('disabled');
    } else if (!$('button[type="submit"]').hasClass("disabled") || !$('input[name="send_form"]').hasClass("disabled")) {
        $('button[type="submit"], button.send_button, input[name="send_form"]').addClass('disabled');
    };
}
$("form.js_validate input:not([type='button']), form.js_validate textarea, form.js_validate  textarea").on("blur", function() {
    if($(this).val() && !$(this).parents("p, div").hasClass("js_class_valid"))
        $(this).parent("p, div").addClass("ok");
});
$("form.js_validate p:not(.js_class_valid) input:not([type='button']), form.js_validate p:not(.js_class_valid) textarea, form.js_validate div.field:not('.js_class_valid') textarea").on("focus", function() {
    $(this).parent("p, div").removeClass("ok");
});

function formatPrice (price) {

    if(price < 10000) {
        return price.toLocaleString('ru-RU',{useGrouping:false});
    } else if (typeof price != 'undefined') {
        return price.toLocaleString('ru-RU');
    }
}

function calculateItemTotal(item) {
    var itemPrice = $(item).data('price');
    var itemPriceOld = $(item).data('price-old');
    $(item).find('.basketItem__infoAdditional').each(function() {
        itemPrice +=$(this).data('price');
        if(itemPriceOld != "") {
            itemPriceOld +=$(this).data('price');
        }

    })
    if($(item).find('.js_itemPrice').data('total')) {
        $(item).find('.js_itemPrice').data('total', itemPrice).text(formatPrice(itemPrice));
        if(itemPriceOld != "") {
            $(item).find('.js_itemPriceOld').data('total', itemPriceOld).text(formatPrice(itemPriceOld));
        }
    } else {
        $(item).find('.js_itemPrice').attr('data-total', itemPrice).text(formatPrice(itemPrice));
        if(itemPriceOld != "") {
            $(item).find('.js_itemPriceOld').attr('data-total', itemPriceOld).text(formatPrice(itemPriceOld));
        }

    }

}
function removeZeros() {
    $('.basketItem__price, .basketItem__priceOld, .js_price').each(function() {
        if($(this).text().length && $(this).text().indexOf(',') == -1 ){
            $(this).text(function(i, origVal) {
                return origVal+',—';
            });
        }
    })
}
function calculateTotal() {
    var totalAmount = 0;
    var totalQuantity = 0;
    $('.basketTableProduct__item').each(function() {
        var thisQuantity = parseInt($(this).find('.js_itemQuantity').val());
        totalQuantity +=thisQuantity
        totalAmount +=($(this).find('.js_itemPrice').data('total')*thisQuantity);
    });
    $('.js_basketTotalAmount').text(formatPrice(totalAmount));
    $('[name="basket_total_amount"]').val(totalAmount);
    $('.js_basketTotalQuantity').text(totalQuantity);
    if(totalQuantity < 100) {
        $('.headerBasketLink__badge').text(totalQuantity);
    } else {
        $('.headerBasketLink__badge').text('99+');
    }
    
    changeWordEnd();
}

function changeWordEnd() {
    var endLetters;
    var endNumber;
    $('.js_tovar').each(function() {
        endLetters = '';
        getEndNumber($(this).prev().text());
        if(endNumber >= 2 && endNumber <=4) {
            endLetters = 'а';
        } else if (endNumber >= 5 && endNumber <=9 || endNumber == 0){
            endLetters = 'ов';
        }
        $(this).find('.wordEnd').remove();
        $(this).append('<span class="wordEnd">'+endLetters+'</span>');
    })
    $('.js_rubli').each(function() {
        endLetters = 'ь';
        getEndNumber($(this).prev().text());
        if(endNumber >= 2 && endNumber <=4) {
            endLetters = 'я';
        } else if (endNumber >= 5 && endNumber <=9 || endNumber == 0){
            endLetters = 'ей';
        }
        $(this).find('.wordEnd').remove();
        $(this).append('<span class="wordEnd">'+endLetters+'</span>');
    })
    $('.js_model').each(function() {
        endLetters = 'ь';
        getEndNumber($(this).prev().text());
        if(endNumber >= 2 && endNumber <=4) {
            endLetters = 'и';
        } else if (endNumber >= 5 && endNumber <=9 || endNumber == 0){
            endLetters = 'ей';
        }
        $(this).find('.wordEnd').remove();
        $(this).append('<span class="wordEnd">'+endLetters+'</span>');
    })
    $('.js_solution').each(function() {
        var words = $(this).text().split(" ");
        endLetters = ["ое","ие"];
        getEndNumber($(this).prev().text());
        if(endNumber >= 2 && endNumber <=4) {
            endLetters = ['ых','ия'];
        } else if (endNumber >= 5 && endNumber <=9 || endNumber == 0){
            endLetters = ['ых','ий'];
        }
        $(this).html(words[0]+endLetters[0]+" <br>"+words[1]+endLetters[1]);
        
    })
    function getEndNumber(number) {
        var sliceInd = 0;
        if(number.indexOf(',') == -1) {
            endNumber  = number.slice(-1);
            if(number.slice(-2) >= 11 && number.slice(-2) <= 19) {
                endNumber = 0;
            }
        } else {
            sliceInd = number.indexOf(',')-number.length;
            endNumber  = number.slice(sliceInd - 1, sliceInd);
            if(number.slice(-4,-2) >= 11 && number.slice(-4,-2) <= 19) {
                endNumber = 0;
            }
        }
    }
}


function sendBasketData(data, redirect) {
    $.ajax({
        url: '/requests/basket_update_props.php',
        type: "POST",
        data: data,
        contentType: false,
        processData: false,
        success: function() {
            if(redirect) {
                // window.location.replace(redirect);
            }
        }
    });
}
function removeFromBasket(item) {
    $(".basketTableProduct").animate({'height': "-="+$(item).outerHeight()});
    $(item).animate({'opacity':0, 'top':'-20px', "height": '0'}, 150, function() {
        var itemParent = $(item).parents('.basketTableProduct__item');
        $(item).remove();
        if($('.basketTableProduct__item').length == 0) {
            $('.fullBasket').animate({'opacity':'0', 'height': '0'}, 150);
            $('.emptyBasket').css('display','block').animate({'opacity':'1'}, 150);
            return;
        }
        if(itemParent.length) {
            calculateItemTotal(itemParent);
        }
        calculateTotal();
        removeZeros();
        showBlankLink();
    })
}

function showBlankLink() {
    if($('.basketTableProduct').height() < 524) {
        $('.basketAside__link a').addClass('hidden');
    } else {
        $('.basketAside__link a').removeClass('hidden');
    }
}

$(document).on('click', '.js_fieldContainer span', function(e) {
    e.stopPropagation();
    var inputImitation = $(this).hasClass('inputImitation')? $(this) : $(this).siblings('.inputImitation');
    var inputWrap = $(this).parent();
    if(!$(inputWrap).hasClass('disabled') && !$(inputWrap).hasClass('js_inaction')) {
        if($(inputImitation).hasClass('checked')){
            if($(inputImitation).hasClass('checkbox')) {
                $(inputWrap).addClass('js_inaction');
                setTimeout(function() {$(inputImitation).siblings('input').prop('checked', false).attr('checked', false); $(inputWrap).removeClass('js_inaction');}, 20);
                $(inputImitation).removeClass('checked');

            } else if ($(inputImitation).hasClass('radio')) {
                return;
            }
        } else {
            if($(inputImitation).hasClass('radio')) {
                $(this).parents('.js_fieldGroup').find('.inputImitation.radio').removeClass('checked');
            } 
            if($(inputImitation).hasClass('checkbox')) {
                $(inputWrap).addClass('js_inaction');
                setTimeout(function() {$(inputWrap).removeClass('js_inaction');}, 20);
            }
            $(inputImitation).addClass('checked');
        }
    }
})

