<!DOCTYPE html>
<html lang="de">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="main.css">
    <link rel="stylesheet" href="L.css">
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
        </div>
        <input type="button" value="" class="rotate-btn" onclick="rotateBtnClick()">
        <div class="page-break main-draft-conteiner">
            <canvas class="main-draft" width="1400" height="700"></canvas>
        </div>
    </section>
    <section class="out">
        <div class="page-break">
            <canvas class="first-draft" width="1400" height="700"></canvas>
        </div>
        <div class="page-break">
            <canvas class="second-draft" width="1400" height="700"></canvas>
        </div>
        <div class="page-break">
            <canvas class="fird-draft" width="1400" height="700"></canvas>
        </div>
        <div class="page-break final-tables">
            <table class="final-table">
                <thead>
                    <tr>
                        <td>Das Punktzeichen</td>
                        <td>X-Versatz</td>
                        <td>Y-Versatz</td>
                    </tr>
                </thead>
                <tbody class="final-tables-first-body"></tbody>
            </table>
            <table class="final-table">
                <thead>
                    <tr>
                        <td>Das Punktzeichen</td>
                        <td>X-Versatz</td>
                        <td>Y-Versatz</td>
                    </tr>
                </thead>
                <tbody class="final-tables-second-body"></tbody>
            </table>
            <table class="final-table">
                <thead>
                    <tr>
                        <td>Das Punktzeichen</td>
                        <td>X-Versatz</td>
                        <td>Y-Versatz</td>
                    </tr>
                </thead>
                <tbody class="final-tables-fird-body"></tbody>
            </table>
        </div>
    </section>
</body>
<script>
    let firstDepth = <?php echo $_POST['first-pedestal-depth']; ?>;
    let secondDepth = <?php echo $_POST['second-pedestal-depth']; ?>;
    let firdDepth = <?php echo $_POST['fird-pedestal-depth']; ?>;

    let firstOverhang = <?php echo $_POST['first-front-overhang']; ?>;
    let secondOverhang = <?php echo $_POST['second-front-overhang']; ?>;
    let firdOverhang = <?php echo $_POST['fird-front-overhang']; ?>;

    let trougth = <?php echo $_POST['first-second-trougth']; ?>;
    let initialBaseSide = '<?php echo $_POST['base-side']; ?>';
    let initialBaseCounter = '<?php echo $_POST['base-counter']; ?>';
</script>
<script src="U-measure.js"></script>
</html>