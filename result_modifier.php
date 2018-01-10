<?

if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
    die();
/** @var CBitrixComponentTemplate $this */
/** @var array $arParams */

/** @var array $arResult */
use Bitrix\Main;

$defaultParams = array(
    'TEMPLATE_THEME' => 'blue'
);
$arParams = array_merge($defaultParams, $arParams);
unset($defaultParams);

$arParams['TEMPLATE_THEME'] = (string) ($arParams['TEMPLATE_THEME']);
if ('' != $arParams['TEMPLATE_THEME']) {
    $arParams['TEMPLATE_THEME'] = preg_replace('/[^a-zA-Z0-9_\-\(\)\!]/', '', $arParams['TEMPLATE_THEME']);
    if ('site' == $arParams['TEMPLATE_THEME']) {
        $templateId = (string) Main\Config\Option::get('main', 'wizard_template_id', 'eshop_bootstrap', SITE_ID);
        $templateId = (preg_match("/^eshop_adapt/", $templateId)) ? 'eshop_adapt' : $templateId;
        $arParams['TEMPLATE_THEME'] = (string) Main\Config\Option::get('main', 'wizard_' . $templateId . '_theme_id', 'blue', SITE_ID);
    }
    if ('' != $arParams['TEMPLATE_THEME']) {
        if (!is_file($_SERVER['DOCUMENT_ROOT'] . $this->GetFolder() . '/themes/' . $arParams['TEMPLATE_THEME'] . '/style.css'))
            $arParams['TEMPLATE_THEME'] = '';
    }
}
if ('' == $arParams['TEMPLATE_THEME'])
    $arParams['TEMPLATE_THEME'] = 'blue';


$rollers = GetHLBlock(ROLLERS);
foreach ($rollers as $roll) {
    $arResult["ROLLERS_NAME"][$roll["UF_XML_ID"]] = stristr("глайдеры", $roll["UF_NAME"]) ? $roll["UF_NAME"] : $roll["UF_NAME"] . " колесики";
}

$mechanism = GetHLBlock(MECHANISM);
foreach ($mechanism as $mech) {
    $arResult["MECHANISM_NAME"][$mech["UF_XML_ID"]] = "Механизм качания " . $mech["UF_NAME"];
}

$cross = GetHLBlock(CROSS);
foreach ($cross as $cros) {
    $arResult["CROSS_NAME"][$cros["UF_XML_ID"]] = $cros["UF_NAME"] . " крестовина";
}
