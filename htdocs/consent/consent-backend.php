<?php

/**
 * (C) Dr. DSGVO
 */
//Referrer checken
$validReferrers = ["localhost", "ihre-webseite.de"]; // vor dem Livegang "ihre-webseite.de" durch die echte Domain ersetzen
$referrer = @$_SERVER['HTTP_REFERER'];
$ok = false;
foreach ($validReferrers as $valid) {
    $host = " " . getHost($referrer);
    if (strpos($host, $valid) > 0) {
        $ok = true;
        break;
    }
}

if (!$ok) {
    echo "notok";
    die();
}
$fkt = filter_input(INPUT_POST, "f");
if ($fkt == "sc") {
    $cc = filter_input(INPUT_POST, "cc");
    $cid = filter_input(INPUT_POST, "cid");
    $ud = filter_input(INPUT_POST, "udd");
    saveConsent($cc, $cid, $ud);
    return;
} else if ($fkt == "cc") {
    $s = createConsentID();
    echo $s;
    return;
}
return;

function saveConsent($consentdata, $consentid, $userdata = null) {
    if ($userdata == null || !$userdata) {
        try {
            $userdata = get_ip_address();
        } catch (Exception $ex) {
            $userdata = "-";
        }
    }
    $filename = "user_consent_drdsgvo.json";
    $c = @file_get_contents($filename);
    if (!$c || $c === null) {
        $c = new stdClass();
        $c->data = [];
    } else {
        $c = json_decode($c);
    }
    $found = false;
    foreach ($c->data as &$one) {
        if ($one->cid == $consentid) {
            if ($consentdata < 1 && $one->c > 0) {
                //Entzug der Einwilligung: Vorige Einwilligung speichern
                $one->prev = clone $one;
            } else {
                unset($one->prev);
            }
            $one->c = $consentdata;
            $one->user = $userdata;//IP,einfacher Fingerprint
            $one->time = timestamp_CMP(time());
            $found = true;
            break;
        }
    }
    if (!$found) {
        $data = new stdClass();
        $data->c = $consentdata;
        $data->user = $userdata;
        $data->cid = $consentid;
        $data->time = timestamp_CMP(time());
        $c->data[] = $data;
    }
    file_put_contents($filename, json_encode($c));
    echo "OK";
}

function timestamp_CMP($zeit) {
    return date("Y-m-d H:i:s", $zeit);
}

function createConsentID() {
    $consentid = createMagicID_CMP(15);
    return $consentid;
}

function createMagicID_CMP($len = 14) {
    $alphabet = "abcdefghjklmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ234567890";
    $res = "";
    for ($i = 0; $i < $len; $i++) {
        $rand = rand(0, strlen($alphabet) - 1);
        $res .= substr($alphabet, $rand, 1);
    }
    return $res;
}

function getConsent($consentid) {
    $filename = "user_consent_drdsgvo.json";
    $c = @file_get_contents($filename);
    if (!$c || $c == null) {
        return null;
    }
    foreach ($c->data as &$one) {
        if ($one->cid == $consentid) {
            return $one->time;//Zeitpunkt der Zustimmung
        }
    }
    return null;
}

/**
 * Retrieves the best guess of the client's actual IP address.
 * Takes into account numerous HTTP proxy headers due to variations
 * in how different ISPs handle IP addresses in headers between hops.
 */
function get_ip_address() {
    // Check for shared internet/ISP IP
    if (!empty($_SERVER['HTTP_CLIENT_IP']) && $validate_ip($_SERVER['HTTP_CLIENT_IP']))
        return $_SERVER['HTTP_CLIENT_IP'];

    // Check for IPs passing through proxies
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // Check if multiple IP addresses exist in var
        $iplist = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        foreach ($iplist as $ip) {
            if (validate_ip($ip))
                return $ip;
        }
    }

    if (!empty($_SERVER['HTTP_X_FORWARDED']) && $validate_ip($_SERVER['HTTP_X_FORWARDED']))
        return $_SERVER['HTTP_X_FORWARDED'];
    if (!empty($_SERVER['HTTP_X_CLUSTER_CLIENT_IP']) && $validate_ip($_SERVER['HTTP_X_CLUSTER_CLIENT_IP']))
        return $_SERVER['HTTP_X_CLUSTER_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_FORWARDED_FOR']) && $validate_ip($_SERVER['HTTP_FORWARDED_FOR']))
        return $_SERVER['HTTP_FORWARDED_FOR'];
    if (!empty($_SERVER['HTTP_FORWARDED']) && $validate_ip($_SERVER['HTTP_FORWARDED']))
        return $_SERVER['HTTP_FORWARDED'];

    // Return unreliable IP address since all else failed
    return $_SERVER['REMOTE_ADDR'];
}

/**
 * Ensures an IP address is both a valid IP address and does not fall within
 * a private network range.
 *
 * @access public
 * @param string $ip
 */
function validate_ip($ip) {
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 |
                  FILTER_FLAG_IPV6 |
                  FILTER_FLAG_NO_PRIV_RANGE |
                  FILTER_FLAG_NO_RES_RANGE) === false)
        return null;
    return $ip;
}

function getHost($url) {
    $o = parse_url($url);
    return @$o["host"];
}
