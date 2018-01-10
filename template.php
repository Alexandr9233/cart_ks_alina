<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
    die();
/** @var array $arParams */
/** @var array $arResult */
/** @global CMain $APPLICATION */
/** @global CUser $USER */
/** @global CDatabase $DB */
/** @var CBitrixComponentTemplate $this */
/** @var string $templateName */
/** @var string $templateFile */
/** @var string $templateFolder */
/** @var string $componentPath */
/** @var CBitrixBasketComponent $component */
$curPage = $APPLICATION->GetCurPage() . '?' . $arParams["ACTION_VARIABLE"] . '=';
$arUrls = array(
    "delete" => $curPage . "delete&id=#ID#",
    "delay" => $curPage . "delay&id=#ID#",
    "add" => $curPage . "add&id=#ID#",
);
unset($curPage);
$arParams['USE_ENHANCED_ECOMMERCE'] = isset($arParams['USE_ENHANCED_ECOMMERCE']) && $arParams['USE_ENHANCED_ECOMMERCE'] === 'Y' ? 'Y' : 'N';
$arParams['DATA_LAYER_NAME'] = isset($arParams['DATA_LAYER_NAME']) ? trim($arParams['DATA_LAYER_NAME']) : 'dataLayer';
$arParams['BRAND_PROPERTY'] = isset($arParams['BRAND_PROPERTY']) ? trim($arParams['BRAND_PROPERTY']) : '';

$arBasketJSParams = array(
    'SALE_DELETE' => GetMessage("SALE_DELETE"),
    'SALE_DELAY' => GetMessage("SALE_DELAY"),
    'SALE_TYPE' => GetMessage("SALE_TYPE"),
    'TEMPLATE_FOLDER' => $templateFolder,
    'DELETE_URL' => $arUrls["delete"],
    'DELAY_URL' => $arUrls["delay"],
    'ADD_URL' => $arUrls["add"],
    'EVENT_ONCHANGE_ON_START' => (!empty($arResult['EVENT_ONCHANGE_ON_START']) && $arResult['EVENT_ONCHANGE_ON_START'] === 'Y') ? 'Y' : 'N',
    'USE_ENHANCED_ECOMMERCE' => $arParams['USE_ENHANCED_ECOMMERCE'],
    'DATA_LAYER_NAME' => $arParams['DATA_LAYER_NAME'],
    'BRAND_PROPERTY' => $arParams['BRAND_PROPERTY']
);
?>
<script type="text/javascript">
    var basketJSParams = <?= CUtil::PhpToJSObject($arBasketJSParams); ?>;
</script>
<?
$APPLICATION->AddHeadScript($templateFolder . "/script.js");
?>
<section class="basketContainer wrap">
    <?
//    if (strlen($arResult["ERROR_MESSAGE"]) <= 0 || !empty($arResult["ITEMS"])) {
    if (!empty($arResult["ITEMS"])) {
        ?>

        <div id="warning_message">
            <?
            if (!empty($arResult["WARNING_MESSAGE"]) && is_array($arResult["WARNING_MESSAGE"])) {
                foreach ($arResult["WARNING_MESSAGE"] as $v)
                    ShowError($v);
            }
            ?>
        </div>
        <?
        $normalCount = count($arResult["ITEMS"]["AnDelCanBuy"]);
        $normalHidden = ($normalCount == 0) ? 'style="display:none;"' : '';

        $delayCount = count($arResult["ITEMS"]["DelDelCanBuy"]);
        $delayHidden = ($delayCount == 0) ? 'style="display:none;"' : '';

        $subscribeCount = count($arResult["ITEMS"]["ProdSubscribe"]);
        $subscribeHidden = ($subscribeCount == 0) ? 'style="display:none;"' : '';

        $naCount = count($arResult["ITEMS"]["nAnCanBuy"]);
        $naHidden = ($naCount == 0) ? 'style="display:none;"' : '';

        foreach (array_keys($arResult['GRID']['HEADERS']) as $id) {
            $data = $arResult['GRID']['HEADERS'][$id];
            $headerName = (isset($data['name']) ? (string) $data['name'] : '');
            if ($headerName == '')
                $arResult['GRID']['HEADERS'][$id]['name'] = GetMessage('SALE_' . $data['id']);
            unset($headerName, $data);
        }
        unset($id);
        ?>
        <div class="wrap fullBasket">   
            <form method="post" action="/requests/orderMake.php" name="basket_form" id="basket_form" class="basketTable js_validate">
                <div id="basket_form_container">
                    <div class="bx_ordercart">             
                        <?
                        include($_SERVER["DOCUMENT_ROOT"] . $templateFolder . "/basket_items.php");
//                        include($_SERVER["DOCUMENT_ROOT"] . $templateFolder . "/basket_items_delayed.php");
//                        include($_SERVER["DOCUMENT_ROOT"] . $templateFolder . "/basket_items_subscribed.php");
//                        include($_SERVER["DOCUMENT_ROOT"] . $templateFolder . "/basket_items_not_available.php");
                        ?>
                    </div>
                </div>
                <input type="hidden" name="BasketOrder" value="BasketOrder" />
                <!-- <input type="hidden" name="ajax_post" id="ajax_post" value="Y"> -->
            </form>
            <div class="basketAside js_fixedBlockWrap">
                <div class="basketTotal js_fixedBlock">
                    <span>
                        <!-- общую сумму расчитываю js -->
                        <span class="basketTotal__amount basketItem__price js_basketTotalAmount"></span>
                        <span class="js_rubli">рубл</span> за <span class="js_basketTotalQuantity"></span> <span class="js_tovar">товар</span>
                    </span>
                </div>
                <div class="basketAside__link">
                    <a href="#" class="linkType1 linkType1-pseudo">Бланк заказа</a>
                </div>
                <div class="basketAside__contacts fixed">
                    <a href="tel:+375291230070" class="basketAside__tel linkTel">+375 29 123-00-70</a>
                    <p class="basketAside__time">Позвоните нам и&nbsp;менеджер заполнит бланк за&nbsp;вас. Работаем&nbsp;с&nbsp;9&nbsp;до&nbsp;20&nbsp;в&nbsp;будни, с&nbsp;11&nbsp;до&nbsp;18&nbsp;в&nbsp;выходные.</p>
                </div>
            </div>
        </div>
        <div class="wrap emptyBasket" style="display:none; opacity: 0;">
            <p class="emptyBasket__title">Товар не выбран</p>
            <p class="emptyBasket__link">
                <a href="/catalog" class="">
                    <? include("../bitrix/templates/kingstyle/img/basket_arrow.svg"); ?>
                </a>
            </p>
        </div>

        <?
    } elseif (strlen($arResult["ERROR_MESSAGE"]) > 0 || empty($arResult["ITEMS"])) {
        ?>
        <div class="wrap emptyBasket"><!--если корзина пуста убрать указанные в атрибуте стили-->
            <p class="emptyBasket__title">Товар не выбран</p>
            <p class="emptyBasket__link">
                <a href="/kresla/" class="">
                    <? include("../bitrix/templates/kingstyle/img/basket_arrow.svg"); ?>
                </a>
            </p>
        </div>
        <?
    } else {
        ShowError($arResult["ERROR_MESSAGE"]);
    }
    ?>
</section>