<?php /* consent-tool von Dr. DSGVO: auf jeder Seite direkt vor </body> einbinden. Seite muss direkt in htdocs liegen. */ ?>
<link rel="stylesheet" href="consent/css/drdsgvo.css">
<script src="consent/js/jquery-2.2.0.min.js"></script>
<script>
    var drdsgvo_imp_link = "/impressum";
    var drdsgvo_dse_link = "/datenschutz";
</script>
<script data-src="consent/website-script.js" id="drdsgvo_script"></script>
<p class="consent-links">
    <a onclick="drdsgvof(1)" style="text-decoration:underline;cursor:pointer">Datenschutzeinstellungen anpassen</a>
    · <a href="https://dr-dsgvo.de" target="_blank">Mit freundlicher Unterstützung von Dr. DSGVO</a>
</p>
<script src="consent/drdsgvo-consent-script.js"></script>
