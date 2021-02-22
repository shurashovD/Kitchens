<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="main.css">
    <title>Kitchen</title>
</head>
<body>
    <section class="measuring">
        <div class="measuring-panel">
            <p class="measuring-dialog"></p>
            <input type="button" value="Zurück" class="panel-btn" onclick="stepDec()">
            <input type="button" value="Weiter" class="panel-btn" onclick="stepInc()">
        </div>
        <div class="canvas-conteiner">
            <canvas id="measuring-canvas" width="980" height="630"></canvas>
            <div class="device-panel">
                <input type="button" value="" class="device-panel__btn lazer-btn" onclick="deviceCheck('modul')">
                <input type="button" value="" class="device-panel__btn roller-btn" onclick="deviceCheck('move')">
                <div class="device-panel-row">
                    <input type="text" name="" id="" class="input-measure" placeholder="Messwerte des Gerätes">
                    <input type="button" class="input-measure-btn" value=">" onclick="getMeasure()" disabled>
                </div>
            </div>
            <div class="verific-row">
                Länge <select class="verific"></select>=
                <input type="text" class="verific__value">mm
                <input type="button" class="verific__action" value="Diskrepanz anzeigen" onclick="showVerific();"><br>
                <p class="verific__error"></p>
            </div>
            <canvas class="display" width="1200" height="800"></canvas>
        </div>
    </section>
    <section class="out">
        <table class="out-table">
            <thead class="out-table-head">
                <tr class="out-table-head-tr">
                    <td class="out-table-head__point">Das Punktzeichen</td>
                    <td class="out-table-head__x">X-Versatz</td>
                    <td class="out-table-head__y">Y-Versatz</td>
                </tr>
            </thead>
            <tbody class="out-table-body"></tbody>
        </table>
    </section>
</body>
<script>
    let dieY = <?php echo $_POST['first-pedestal-depth'] + $_POST['first-front-overhang']; ?>;
    let dieX = <?php echo $_POST['first-diex']; ?>;
</script>
<script src="measure.js"></script>
</html>