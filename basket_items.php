<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
    die();
/** @var array $arParams */
/** @var array $arResult */
/** @var array $arUrls */

/** @var array $arHeaders */
use Bitrix\Sale\DiscountCouponsManager;

$Deliveries = GetDelivery();
$pay = GetPay();
//print_r($pay);

if (!empty($arResult["ERROR_MESSAGE"]))
    ShowError($arResult["ERROR_MESSAGE"]);

$bDelayColumn = false;
$bDeleteColumn = false;
$bWeightColumn = false;
$bPropsColumn = false;
$bPriceType = false;
//print_r($arResult);
?>
<div class="basketTableProduct" id="basket_items_list">
    <div class="basketTableProduct__title">
        <span class="basketTitle__img" id="NAME">Товар</span>
        <span class="basketTitle__text" id="DELETE"></span>
        <span class="basketTitle__quantity" id="QUANTITY">Количество, штук</span>
        <span class="basketTitle__price" id="PRICE">Цена, руб.</span>    
    </div>

    <? foreach ($arResult["ITEMS"] as $key => $arItem) { ?>

        <div class="basketTableProduct__item" data-price="<?= round($arItem["PRICE"], 2) ?>" data-price-old="<?= $arItem["sumDiscount"] != 0 ? round($arItem["FullPrice"], 2) : "" ?>">
            <div class="basketItem__img">
                <? if ($arItem["DETAIL_PICTURE"] || $arItem["PROPS"]["DETAIL_PICTURE"]) { ?>
                    <img src="<?= $arItem["DETAIL_PICTURE"] ? $arItem["DETAIL_PICTURE"] : $arItem["PROPS"]["DETAIL_PICTURE"] ?>" 
                         alt="<?= $arItem["NAME"] ? $arItem["NAME"] : $arItem["PROPS"]["NAME"] ?>">
                     <? } ?>
            </div>
            <div class="basketItem__info">
                <div class="basketItem__infoMain">
                    <div class="infoMain__text">
                        <a href="<?= $arItem["PROPS"]["DETAIL_PAGE_URL"] ?>" class="infoMain__name"><span class="linkType2"><?= $arItem["NAME"] ? $arItem["NAME"] : $arItem["PROPS"]["NAME"] ?></span></a>
                        <span class="infoMain__label"><?= $arItem["STR_BIRKI"] ?></span>
                        <input type="hidden" name="item_id" value="<?= $arItem["ID"] ?>"><!--тут id товара-->
                        <!-- нужен инпут с ценой? -->
                    </div>
                    <div class="infoMain__quantity">                      
                        <input type="number"  id="QUANTITY_INPUT_<?= $arItem["ID"] ?>" name="item_quantity"
                               name="QUANTITY_INPUT_<?= $arItem["ID"] ?>"
                               value="<?= $arItem["QUANTITY"] ?>"
                               class="js_itemQuantity"
                               onchange="updateQuantity('QUANTITY_INPUT_<?= $arItem["ID"] ?>', '<?= $arItem["ID"] ?>', 1, false)"
                               >    
                    </div>
                    <input type="hidden" id="QUANTITY_<?= $arItem['ID'] ?>" name="quantity_<?= $arItem['ID'] ?>" value="<?= $arItem["QUANTITY"] ?>" />
                    <div class="infoMain__price">
                        <span class="basketItem__price js_itemPrice"></span>
                        <span class="basketItem__priceOld js_itemPriceOld"></span>
                    </div>
                </div>
                <!-- дополнение к товару -->
                <!-- нужны инпуты для параметров дополнений (имя, цена)? -->
                <!-- цену дополнения, пожалуйста, передавай в дата-атрибут в виде числа -->
                <?
                if ($arItem["DOP"]["ROLLERS"] && ($arItem["DOP"]["ROLLERS"] != $arItem["STANDART_ROLLERS"])) {
                    /* print_r($arItem["STANDART_ROLLERS"] );
                      print_r($arItem);
                      die(); */
                    ?>
                    <div class="basketItem__infoAdditional" data-price="<?= $arItem["DOP_PRICE"]["ROLLERS_PRICE"] ?>">
                        <div class="infoAdditional__text">
                            <span class="infoAdditional__name"><?= $arResult["ROLLERS_NAME"][$arItem["DOP"]["ROLLERS"]] ?></span>
                            <span class="infoAdditional__remove removeButton js_removeAdditional" 
                                  data-baza="<?= $arItem["STANDART_ROLLERS"] ?>" data-code="ROLLERS">Вернуть базу</span>
                        </div>
                        <div class="infoAdditional__price">
                            <span class="basketItem__price"></span>
                        </div>
                    </div>
                <? } ?>
                <? if ($arItem["DOP"]["MECHANISM"] && ($arItem["DOP"]["MECHANISM"] != $arItem["STANDART_MECHAHISM"])) { ?>
                    <div class="basketItem__infoAdditional" data-price="<?= $arItem["DOP_PRICE"]["MECHANISM_PRICE"] ?>">
                        <div class="infoAdditional__text">
                            <span class="infoAdditional__name"><?= $arResult["MECHANISM_NAME"][$arItem["DOP"]["MECHANISM"]] ?></span>
                            <span class="infoAdditional__remove removeButton js_removeAdditional" 
                                  data-baza="<?= $arItem["STANDART_MECHAHISM"] ?>" data-code="MECHANISM">Вернуть базу</span>
                        </div>
                        <div class="infoAdditional__price">
                            <span class="basketItem__price"></span>
                        </div>
                    </div>
                <? } ?>
                <? if ($arItem["DOP"]["CROSS"] && ($arItem["DOP"]["CROSS"] != $arItem["STANDART_CROSS"])) { ?>
                    <div class="basketItem__infoAdditional" data-price="<?= $arItem["DOP_PRICE"]["CROSS_PRICE"] ?>">
                        <div class="infoAdditional__text">
                            <span class="infoAdditional__name"><?= $arResult["CROSS_NAME"][$arItem["DOP"]["CROSS"]] ?></span>
                            <span class="infoAdditional__remove removeButton js_removeAdditional"
                                  data-baza="<?= $arItem["STANDART_CROSS"] ?>" data-code="CROSS">Вернуть базу</span>
                        </div>
                        <div class="infoAdditional__price">
                            <span class="basketItem__price"></span>
                        </div>
                    </div>
                <? } ?>

            </div>
            <div class="basketItem__infoRemove"><span class="removeButton js_removeItem">Убрать</span></div>         
        </div>
    <? } ?>
</div>

<input type="hidden" id="column_headers" value="<?= htmlspecialcharsbx(implode($arHeaders, ",")) ?>" />
<input type="hidden" id="offers_props" value="<?= htmlspecialcharsbx(implode($arParams["OFFERS_PROPS"], ",")) ?>" />
<input type="hidden" id="action_var" value="<?= htmlspecialcharsbx($arParams["ACTION_VARIABLE"]) ?>" />
<input type="hidden" id="quantity_float" value="<?= ($arParams["QUANTITY_FLOAT"] == "Y") ? "Y" : "N" ?>" />
<input type="hidden" id="price_vat_show_value" value="<?= ($arParams["PRICE_VAT_SHOW_VALUE"] == "Y") ? "Y" : "N" ?>" />
<input type="hidden" id="hide_coupon" value="<?= ($arParams["HIDE_COUPON"] == "Y") ? "Y" : "N" ?>" />
<input type="hidden" id="use_prepayment" value="<?= ($arParams["USE_PREPAYMENT"] == "Y") ? "Y" : "N" ?>" />
<input type="hidden" id="auto_calculation" value="<?= ($arParams["AUTO_CALCULATION"] == "N") ? "N" : "Y" ?>" />

<div class="basketTableBuyer" >
    <p class="basketBuyer__title">Бланк заказа</p>
    <input type="hidden" name="basket_total_amount">
    <? if (!empty($Deliveries)) { ?>
        <div class="basketBuyer__fieldGroup">
            <p class="basketBuyer__fieldGroupTitle fieldTitle">Доставка</p>
            <ul class="basketBuyer__fieldGroupList js_fieldGroup">
                <? foreach ($Deliveries as $delivery) {
                    ?>
                    <li class="fieldGroupList__itemContainer">
                        <label class="fieldGroupList__item js_fieldContainer">
                            <input type="radio" name="basket_delivery" value="<?= strip_tags($delivery["NAME"]) ?>">
                            <input type="hidden" name="basket_delivery_id" value="<?= $delivery["ID"] ?>">
                            <span class="inputImitation radio fieldGroupList__itemInput"><span class="radio__dot"></span></span>
                            <span class="fieldGroupList__itemLabel inputImitationLabel"><?= $delivery["NAME"] ?></span>
                            <span class="fieldGroupList__itemInfo"><?= $delivery["DESCRIPTION"] ?></span>
                        </label>
                    </li>
                <? } ?>
                <!--            <li class="fieldGroupList__itemContainer">
                                <label class="fieldGroupList__item js_fieldContainer">
                                    <input type="radio" name="basket_delivery" value="в другой город">
                                    <input type="hidden" name="basket_delivery_id" value="">
                                    <span class="inputImitation radio fieldGroupList__itemInput"><span class="radio__dot"></span></span>
                                    <span class="fieldGroupList__itemLabel inputImitationLabel">в другой город</span>
                                    <span class="fieldGroupList__itemInfo">15—20 руб. Доставим за 1—3 дня. Менеджер скажет стоимость после подтверждения заказа.</span>
                                </label>
                            </li>
                            <li class="fieldGroupList__itemContainer">
                                <label class="fieldGroupList__item js_fieldContainer">
                                    <input type="radio" name="basket_delivery" value="самовывоз в Минске">
                                    <input type="hidden" name="basket_delivery_id" value="">
                                    <span class="inputImitation radio fieldGroupList__itemInput"><span class="radio__dot"></span></span>
                                    <span class="fieldGroupList__itemLabel inputImitationLabel">самовывоз в Минске</span>
                                    <span class="fieldGroupList__itemInfo"></span>
                                </label>
                            </li>-->

            </ul>
        </div>
    <? } ?>
    <? if (!empty($pay)) { ?>
        <div class="basketBuyer__fieldGroup">
            <p class="basketBuyer__fieldGroupTitle fieldTitle">Оплата</p>
            <ul class="basketBuyer__fieldGroupList js_fieldGroup">
                <? foreach ($pay as $pa) { ?>
                    <li class="fieldGroupList__itemContainer">
                        <label class="fieldGroupList__item js_fieldContainer">
                            <input type="radio" name="basket_payment" value="<?= $pa["NAME"] ?>">
                            <input type="hidden" name="basket_payment_id" value="<?= $pa["ID"] ?>">
                            <span class="inputImitation radio fieldGroupList__itemInput"><span class="radio__dot"></span></span>
                            <span class="fieldGroupList__itemLabel inputImitationLabel"><?= $pa["NAME"] ?></span>
                            <span class="fieldGroupList__itemInfo"></span>
                        </label>
                    </li>
                <? } ?>
                <!--            <li class="fieldGroupList__itemContainer">
                                <label class="fieldGroupList__item js_fieldContainer">
                                    <input type="radio" name="basket_payment" value="банковской картой">
                                    <input type="hidden" name="basket_payment_id" value="">
                                    <span class="inputImitation radio fieldGroupList__itemInput"><span class="radio__dot"></span></span>
                                    <span class="fieldGroupList__itemLabel inputImitationLabel">банковской картой</span>
                                    <span class="fieldGroupList__itemInfo"></span>
                                </label>
                            </li>
                            <li class="fieldGroupList__itemContainer">
                                <label class="fieldGroupList__item js_fieldContainer">
                                    <input type="radio" name="basket_payment" value="через систему «Расчёт»">
                                    <input type="hidden" name="basket_payment_id" value="">
                                    <span class="inputImitation radio fieldGroupList__itemInput"><span class="radio__dot"></span></span>
                                    <span class="fieldGroupList__itemLabel inputImitationLabel">через систему «Расчёт»</span>
                                    <span class="fieldGroupList__itemInfo"></span>
                                </label>
                            </li>
                            <li class="fieldGroupList__itemContainer">
                                <label class="fieldGroupList__item js_fieldContainer">
                                    <input type="radio" name="basket_payment" value="«Халва» и «Карта покупок»">
                                    <input type="hidden" name="basket_payment_id" value="">
                                    <span class="inputImitation radio fieldGroupList__itemInput"><span class="radio__dot"></span></span>
                                    <span class="fieldGroupList__itemLabel inputImitationLabel">«Халва» и «Карта покупок»</span>
                                    <span class="fieldGroupList__itemInfo"></span>
                                </label>
                            </li>
                            <li class="fieldGroupList__itemContainer">
                                <label class="fieldGroupList__item js_fieldContainer">
                                    <input type="radio" name="basket_payment" value="безналичный расчёт">
                                    <input type="hidden" name="basket_payment_id" value="">
                                    <span class="inputImitation radio fieldGroupList__itemInput"><span class="radio__dot"></span></span>
                                    <span class="fieldGroupList__itemLabel inputImitationLabel">безналичный расчёт</span>
                                    <span class="fieldGroupList__itemInfo"></span>
                                </label>
                            </li>-->
            </ul>
        </div>
    <? } ?>
    <p class="basketBuyer__field js_class_valid">
        <label for="client_name_basket" class="fieldTitle">Имя</label>
        <input id="client_name_basket" type="text" name="name" data-valid="name" data-valid-min="2" class="fieldInput fieldShort" autocomplete="off">
        <span class="fieldDetail error side">Менеджер не&nbsp;сможет обратиться&nbsp;к&nbsp;вам по&nbsp;этому имени</span>
    </p>
    <p class="basketBuyer__field js_class_valid">
        <label for="client_tel_basket" class="fieldTitle">Телефон</label>
        <input id="client_tel_basket" type="tel" name="phone" data-valid="phone" class="fieldInput fieldShort" autocomplete="off">
        <span class="fieldDetail error side">Менеджер не&nbsp;дозвонится по&nbsp;этому&nbsp;номеру</span>
        <span class="fieldDetail bottom">+375 29 666-12-34</span>
    </p>
    <p class="basketBuyer__field">
        <label for="client_email_basket" class="fieldTitle">Эл. почта</label>
        <input id="client_email_basket" type="email" name="email" class="fieldInput fieldLong">
        <span class="fieldDetail side">Необязательно, но&nbsp;без почты мы&nbsp;не&nbsp;отправим вам чек.</span>
    </p>
    <p class="basketBuyer__field textareaField">
        <label for="client_message_basket" class="fieldTitle">Сообщение</label>
        <textarea name="message" id="client_message_basket" class="fieldInput fieldLong"></textarea>
        <span class="fieldDetail side">Укажите желаемое время доставки. Привезти кресло в&nbsp;<span class="linkType1 linkType1-pseudo js_basket" data-delivery="assembled">собранном</span> или&nbsp;<span class="linkType1 linkType1-pseudo js_basket" data-delivery="disassembled">разобранном виде?</span></span>
    </p>
    <p class="formSubmitButton">
        <button type="submit" class="button button-active button-order fieldLong disabled">Отправить</button>
        <span class="fieldDetail side">Имя и&nbsp;телефон&nbsp;&mdash; обязательно</span>
    </p>
</div>
<script>
    $(document).ready(function () {
        var validator = new Validator();
    });
</script>