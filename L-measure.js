const canvasConteiner = document.querySelector('.canvas-conteiner');
const measuringCanvas = document.querySelector('#measuring-canvas');
const measuringCanvasCtx = measuringCanvas.getContext('2d');
const measuringDialog = document.querySelector('.measuring-dialog');
const inputMeasure = document.querySelector('.input-measure');
const inputMeasureBtn = document.querySelector('.input-measure-btn');
const devicePanel = document.querySelector('.device-panel');
const pageBreakers = document.querySelectorAll('.page-break');
const verificRow = document.querySelector('.verific-row');
const verific = document.querySelector('.verific');
const verificValue = document.querySelector('.verific__value');
const verificAction = document.querySelector('.verific__action');
const errorMsg = document.querySelector('.verific__error');
const mainDraft = document.querySelector('.main-draft');
const firstDraft = document.querySelector('.first-draft');
const secondDraft = document.querySelector('.second-draft');
const finalTablesFirstBody = document.querySelector('.final-tables-first-body');
const finalTablesSecondBody = document.querySelector('.final-tables-second-body');

const Letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const lettersMap = new Map();
Letters.forEach((e, i) => lettersMap.set(i, e));

let MeasPoints = new Map();
let Step = 0;
let COORDS = [];
let MATRIX = [];
let displayCoords = [];
let nonImpactPoints = [];
let firstCounter = [];
let secondCounter = [];
let firdCounter = [];

let scale = 1;

let dieCoordsX = [];
let dieCoordsY = [];

let initialBasePointOne, initialBasePointTwo;   // точки базовой стороны;
let initialBaseSideOrientVertical = true;       // ориентация базовой столешницы;
let initialLeftAngle = null;                    // угловая точка;

const stepBy = () => {
    if ( Step == 0 ) {
        renderCanvas();
        measuringDialog.textContent = 'Stellen Sie Meßpunkt auf. ';
        measuringDialog.textContent += 'Beginnen Sie von näheren linken Punkt. ';
        measuringDialog.textContent += 'Machen umschichtigen Umlaufsinn im Uhrzeigerdrehsinn. ';
        measuringDialog.title = 'Расставьте точки измерения';
    }
    if ( Step == 1 ) {
        measuringDialog.textContent = 'Geben Sie Daten von Messgeräten ein. ';
        measuringDialog.textContent += 'Wählen Sie Messabschnitt in rechtem niedrigem Teil des Bildschirms. ';
        measuringDialog.title = 'Введите данные с измерительных приборов';
        lettersMap.forEach((item, index) => {
            if ( index < MeasPoints.size ) {
                measuringCanvasCtx.moveTo(490, 550);
                measuringCanvasCtx.lineTo(MeasPoints.get(item).x, MeasPoints.get(item).y);
                if ( MeasPoints.has(lettersMap.get(index+1)) )
                measuringCanvasCtx.lineTo(MeasPoints.get(lettersMap.get(index+1)).x, MeasPoints.get(lettersMap.get(index+1)).y);
            }
        });
    }
    if ( Step == 2 ) {
        measuringDialog.textContent = 'Bemessungen sind beendet. ';
        measuringDialog.textContent += 'Um weiter zu gehen klicken Sie „Weiter“. ';
        measuringDialog.title = 'Замер завершен. Для продолжения жмите "Далее"';
        completeAngleAndMove();
    }
    if ( Step == 3 ) {
        if ( !structData() ) {
            measuringDialog.textContent = 'Fehler.';
            return false;
        }
        if ( !testInputData() ) {
            measuringDialog.textContent = 'Fehler.';
            return false;
        }
        renderDraw();
        completeVerificSide();
        measuringDialog.textContent = 'Meßfehlerrechnung. ';
        measuringDialog.textContent += 'Dieser Punkt kann versäumt werden „Weiter“ zu klicken. ';
        measuringDialog.title = 'Расчет погрешности. Для пропуска жмите "Далее"';
        canvasConteiner.childNodes.forEach(node => {
            if ( 'style' in node )
            node.style.display = 'none'; 
        });
        verificRow.style.display = 'flex';
    }
    if ( Step == 4 ) {
        measuringDialog.textContent = 'Um zu drücken, klicken Sie „Weiter“. ';
        measuringDialog.title = 'Для перехода к печати жмите "Далее"';
        //measuringDialog.textContent += 'Для поворота чертежа используйте кнопку в правой части экрана. ';
        canvasConteiner.style.display = 'none';
        document.querySelector('.main-draft-conteiner').style.display = 'block';
    }
    if ( Step == 5 ) {
        document.querySelector('.measuring-panel').style.display = 'none';
        document.querySelector('.out').style.display = 'block';
    }
}

// обновить canvas;
const renderCanvas = () => {
    measuringCanvasCtx.fillStyle = '#ffffff';
    measuringCanvasCtx.fillRect(0, 0, 980, 630);
    measuringCanvasCtx.strokeStyle = '#ff0000';
    measuringCanvasCtx.setLineDash([1,0]);
    measuringCanvasCtx.lineWidth = 2;
    measuringCanvasCtx.strokeRect(40, 40, 900, 550);
    measuringCanvasCtx.beginPath();
    measuringCanvasCtx.arc(490, 550, 10, 0, 2*Math.PI);
    measuringCanvasCtx.closePath();
    measuringCanvasCtx.stroke();
    MeasPoints.forEach((item, key) => {
        if ( (item.x != 0)&&(item.y != 0) ) {
            let color = '#00ff00';
            if ( item.modul==0 && item.move==0 ) color = '#ff0000';
            if ( item.modul==0 ^ item.move==0 ) color = '#ffff00';
            if ( key=='A' && item.modul!=0 ) color = '#00ff00';
            pointByCoords(item.x, item.y, color);
            measuringCanvasCtx.stroke();
        }
    });
}

// обновить чертеж;
const renderDraw = () => {
    if ( initialBaseSide ) {
        initialBasePointOne = 'A';
        initialBasePointTwo = initialLeftAngle;
    }
    else {
        initialBasePointOne = initialLeftAngle;
        initialBasePointTwo = lettersMap.get(MeasPoints.size-1);
    }
    baseToDecart();
    changeDatumPoint(MATRIX['A'].x, MATRIX['A'].y, MATRIX);
    const basePointOne = initialBasePointOne;
    const basePointTwo = initialBasePointTwo;
    const dX = MATRIX[basePointTwo].x - MATRIX[basePointOne].x;
    const dY = MATRIX[basePointTwo].y - MATRIX[basePointOne].y;
    let angle = Math.atan2(dY, dX);
    if ( initialBaseSideOrientVertical )
    angle -= Math.PI/2;
    rotate(MATRIX, angle);
    if ( initialBaseSideOrientVertical ) {
        if ( initialBaseSide ) {
            if ( MATRIX[basePointOne].y>MATRIX[basePointTwo].y )
            rotate(MATRIX, Math.PI);
        }
        else {
            if ( MATRIX[basePointOne].y<MATRIX[basePointTwo].y )
            rotate(MATRIX, Math.PI);
        }
    }
    else {
        if ( MATRIX[basePointOne].x>MATRIX[basePointTwo].x )
        rotate(MATRIX, Math.PI);
    }
    if ( (MATRIX[basePointOne].x-MATRIX[basePointTwo].x).toFixed()>0 )
    if ( (MATRIX[basePointOne].y-MATRIX[basePointTwo].y).toFixed()>0 )
    rotate(MATRIX, Math.PI);
    addInternalPoints();
    let newBaseX = MATRIX['A'].x;
    let newBaseY = MATRIX['A'].y;
    for (let pointKey in MATRIX) {
        if ( MATRIX[pointKey].x < newBaseX ) newBaseX = MATRIX[pointKey].x;
        if ( MATRIX[pointKey].y < newBaseY ) newBaseY = MATRIX[pointKey].y;
    }
    changeDatumPoint(newBaseX, newBaseY, MATRIX);
    const direction = initialBaseCounter;
    displayFromMatrix(70, 70, direction);
    displaySize();
    if ( initialBaseSideOrientVertical^initialBaseSide )
    rotate(secondCounter, -Math.PI/2);
    else rotate(firstCounter, Math.PI/2);
    newBaseX = firstCounter[0].x;
    newBaseY = firstCounter[0].y;
    for ( let i in firstCounter ) {
        if ( firstCounter[i].x<newBaseX ) newBaseX = firstCounter[i].x;
        if ( firstCounter[i].y<newBaseY ) newBaseY = firstCounter[i].y;
    }
    changeDatumPoint(newBaseX, newBaseY, firstCounter);
    displayFrom(firstCounter, firstDraft, finalTablesFirstBody);
    newBaseX = secondCounter[0].x;
    newBaseY = secondCounter[0].y;
    for ( let i in secondCounter ) {
        if ( secondCounter[i].x<newBaseX ) newBaseX = secondCounter[i].x;
        if ( secondCounter[i].y<newBaseY ) newBaseY = secondCounter[i].y;
    }
    changeDatumPoint(newBaseX, newBaseY, secondCounter);
    displayFrom(secondCounter, secondDraft, finalTablesSecondBody);
}

// следующий шаг;
const stepInc = () => {
    Step++;
    stepBy();
}

// предыдущий шаг;
const stepDec = () => {
    if ( --Step < 0 ) Step = 0;
    if ( Step == 3 ) Step = 1;
    if ( Step == 2 ) Step = 1;
    stepBy();
}

// вывод точки с координатами на экран;
const pointByCoords = (x, y, color) => {
    measuringCanvasCtx.fillStyle = color;
    measuringCanvasCtx.beginPath();
    measuringCanvasCtx.arc(x, y, 4, 0, 2*Math.PI);
    measuringCanvasCtx.closePath();
    measuringCanvasCtx.fill();
}

// введено показание прибора;
const getMeasure = () => {
    if ( Step != 1 ) return;
    if ( isNaN(inputMeasure.value) ) return; 
    MeasPoints.get(inputMeasure.name)[inputMeasure.getAttribute('data-measure')] = inputMeasure.value;
    renderCanvas();
    inputMeasureBtn.setAttribute('disabled', true);
    measureCompleteCheck();
}

const deviceCheck = (prop) => {
    if ( Step != 1 ) return;
    renderCanvas();
    const key = Letters.find(item => {
        if ( !MeasPoints.has(item) ) return null;
        if ( prop == 'modul' )
        return MeasPoints.get(item)[prop] == 0;
        if ( prop=='move' && item != 'A'  )
        return MeasPoints.get(item)[prop] == 0;
    });
    if ( !key ) return;
    inputMeasure.value = '';
    inputMeasure.focus();
    inputMeasureBtn.removeAttribute('disabled');
    inputMeasure.name = key;
    inputMeasure.setAttribute('data-measure', prop);
    measuringCanvasCtx.lineWidth = 1;
    measuringCanvasCtx.setLineDash([4,4]);
    measuringCanvasCtx.strokeStyle = '#808080';
    measuringCanvasCtx.beginPath();
    if ( prop == 'modul' ) {
        measuringCanvasCtx.moveTo(490, 550);
        measuringCanvasCtx.lineTo(MeasPoints.get(key).x, MeasPoints.get(key).y);
    }
    if ( prop == 'move' ) {
        measuringCanvasCtx.moveTo(MeasPoints.get(key).x, MeasPoints.get(key).y);
        measuringCanvasCtx.lineTo(
            MeasPoints.get(lettersMap.get(Letters.indexOf(key) - 1)).x,
            MeasPoints.get(lettersMap.get(Letters.indexOf(key) - 1)).y
        );
    }
    measuringCanvasCtx.closePath();
    measuringCanvasCtx.stroke();
}

// проверка замера на завершенность;
const measureCompleteCheck = () => {
    let multy = 1;
    MeasPoints.forEach((point, key) => {
        multy *= point.modul;
        if ( key != 'A' ) multy *= point.move;
    });
    if ( multy != 0 ) {
        Step++;
        stepBy();
    }
}

// расчет угла по модулю и перемещению;
const calcAngle = (a, b, c) => {
    a = parseFloat(a);
    b = parseFloat(b);
    c = parseFloat(c);
    if ( (a*b*c == 0) || (b+c<=a) || (a+c<=b) || (a+b<=c) ) {
        measuringDialog.textContent = 'Ошибка данных. Повторите замер.';
        return 0;
    }
    let cos = (b*b + c*c - a*a)/(2*b*c);
    let angle = Math.acos(cos)/Math.PI*180;
    angle = angle.toFixed(2);
    return angle;
}

// дополнить расчетными значениями угла и перемещения;
const completeAngleAndMove = () => {
    MeasPoints.forEach((item, key) => {
        if ( key != 'A' ) {
            item.angle = ( item.angle == 0 ) ? calcAngle(item.move, item.modul, MeasPoints.get(lettersMap.get(Letters.indexOf(key) - 1)).modul) : item.angle;
            item.move = ( item.move == 0 ) ? calcMove(modul, MeasPoints.get(lettersMap.get(Letters.indexOf(key) - 1)).modul, item.angle) : item.move;
        }
    });
}

// сохранение замера в массиве COORDS;
const structData = () => {
    let length = 0;
    for ( let keys in COORDS ) length++;
    if ( length == 0 ) {
        for (let i=0; i<MeasPoints.size+3; i++) {
            COORDS[Letters[i]] = {'modul':0, 'move':0, 'angle':0};
        }
    }
    MeasPoints.forEach((item, key) => {
        COORDS[key] = { modul: item.modul, move: item.move, angle: item.angle };
    });
    for (let key in COORDS) {
        if ( key == 'A' ) {
            if ( COORDS[key].modul == 0 ) return false;
            continue;
        }
        for ( let prop in COORDS[key] ) {
            if ( COORDS[key][prop] == 'undefined' ) return false;
        }
    }
    return true;
}

// проверка введенных данных;
const testInputData = () => {
    if ( COORDS['A'].modul == 0 ) {
        measuringDialog.textContent = 'Ошибка расположения точки А.';
        return false;
    }
    for ( let point in COORDS ) {
        if ( Letters.indexOf(point) == (MeasPoints.size-1) ) return true;
        if ( point != 'A' ) {
            const prevPoint = lettersMap.get(Letters.indexOf(point) - 1);
            const a = parseFloat(COORDS[prevPoint].modul);
            const b = parseFloat(COORDS[point].move);
            const c = parseFloat(COORDS[point].modul);
            if ( (a+b)<=c || (a+c)<=b || (b+c)<=a ) {
                measuringDialog.textContent = 'Ошибка взаиморасположения точек ' + prevPoint + ' и ' + point + '.';
                return false;
            }
        }
    }
    return true;
}

// создание массива Matrix, переход в декартову и полярную СК;
const baseToDecart = () => {
    MATRIX = [];
    let Fi = 0;
    for ( let pointKey in COORDS ) {
        const r = COORDS[pointKey].modul;
        Fi -= COORDS[pointKey].angle/180*Math.PI;
        const x = r * Math.cos(Fi);
        const y = r * Math.sin(Fi);
        let point = {
            'x': x,
            'y': y,
            'r': r,
            'fi': Fi
        };
        MATRIX[pointKey] = point;
    }
    return true;
}

// вычисление Фи;
const calcFi = (x, y) => {
    if ( y > 0 ) {
        if ( x == 0 )
        return Math.PI/2;
        if ( x > 0 )
        return Math.atan2(y, x);
        if ( x < 0 )
        return (Math.PI - Math.atan2(y, Math.abs(x)));
    }
    if ( y == 0 ) {
        if ( x < 0 )
        return Math.PI;
        if ( x > 0 )
        return 0;
        if ( x == 0 )
        return 0;
    }
    if ( y < 0 ) {
        if ( x < 0 )
        return (Math.PI + Math.atan2(Math.abs(y), Math.abs(x)));
        if ( x == 0 )
        return 1.5*Math.PI;
        if ( x > 0 )
        return (2*Math.PI - Math.atan2(Math.abs(y), x));
    }
}

// сменить точку отсчета;
const changeDatumPoint = (dX, dY, array) => {
    for ( let pointKey in array ) {
        const x = array[pointKey].x - dX;
        const y = array[pointKey].y - dY;
        const r = Math.sqrt(x*x + y*y);
        let fi = calcFi(x, y);
        array[pointKey].x = x;
        array[pointKey].y = y;
        array[pointKey].r = r;
        array[pointKey].fi = fi;
    }
    return true;
}

// поворот замера;
const rotate = (array, angle) => {
    for ( let pointKey in array ) {
        array[pointKey].fi -= angle;
        const r = array[pointKey].r;
        array[pointKey].x = r*Math.cos(array[pointKey].fi);
        array[pointKey].y = r*Math.sin(array[pointKey].fi);
    }
}

// обновить точку в MATRIX по Х и У;
const updatePointInMatrix = (point, x, y) => {
    if ( isNaN(x*y) ) return false;
    if ( !( point in MATRIX ) ) return false;
    let r = Math.sqrt(x*x + y*y);
    let Fi = calcFi(x, y);
    if ( isNaN(r*Fi) ) return false;
    MATRIX[point].x = x;
    MATRIX[point].y = y;
    MATRIX[point].r = r;
    MATRIX[point].fi = Fi;
    return true;
}

// добавление внутренних точек;
const addInternalPoints = () => {
    const firstWidthWorkTop = parseInt(firstDepth) + parseInt(firstOverhang);
    const secondWidthWorkTop = parseInt(secondDepth) + parseInt(secondOverhang);

    const leftAngleNum = Letters.indexOf(initialLeftAngle);
    let length = 0;
    for ( let pointKey in MATRIX ) length++;

    if ( initialBaseSide ) {
        if (initialBaseSideOrientVertical) {
            let c = leftAngleNum;
            let x = parseFloat(MATRIX['A'].x);
            let y = parseFloat(MATRIX['A'].y);
            while (nonImpactPoints.includes(Letters[c])) c--;
            for ( let i=0; i<=c; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].x>x ) x = MATRIX[Letters[i]].x;
            }
            x += parseFloat(firstWidthWorkTop);
            updatePointInMatrix(Letters[length-1], x, y);

            let c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            y = parseFloat(MATRIX[Letters[c]].y);
            for ( let i=leftAngleNum; i<MeasPoints.size; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].y<y ) y = MATRIX[Letters[i]].y;
            }
            y -= secondWidthWorkTop;
            updatePointInMatrix(Letters[length-2], x, y);

            console.log(MATRIX);
            x = parseFloat(MATRIX[Letters[length-4]].x);
            updatePointInMatrix(Letters[length-3], x, y);
        }
        else {
            let c = leftAngleNum;
            let x = parseFloat(MATRIX['A'].x);
            let y = parseFloat(MATRIX['A'].y);
            while (nonImpactPoints.includes(Letters[c])) c--;
            for ( let i=0; i<=c; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].y<y ) y = MATRIX[Letters[i]].y;
            }
            y -= parseFloat(firstWidthWorkTop);
            updatePointInMatrix(Letters[length-1], x, y);

            c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            x = MATRIX[Letters[c]].x;
            for (let i=leftAngleNum; i<MeasPoints.size; i++) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].x<x ) x = MATRIX[Letters[i]].x; 
            }
            x -= parseFloat(secondWidthWorkTop);
            updatePointInMatrix(Letters[length-2], x, y);

            y = MATRIX[Letters[MeasPoints.size-1]].y;
            updatePointInMatrix(Letters[length-3], x, y);
        }
    }
    else {
        if (initialBaseSideOrientVertical) {
            let c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            let x = MATRIX[Letters[c]].x;
            for ( let i=c; i<MeasPoints.size; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].x<x ) x = MATRIX[Letters[i]].x;
            }
            x -= parseFloat(secondWidthWorkTop);
            let y = MATRIX[Letters[MeasPoints.size-1]].y;
            updatePointInMatrix(Letters[length-3], x, y);

            c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c--;
            y = MATRIX[Letters[c]].y;
            for ( let i=0; i<=c; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].y<y ) y = MATRIX[Letters[i]].y;
            }
            y -= parseFloat(firstWidthWorkTop);
            updatePointInMatrix(Letters[length-2], x, y);

            x = MATRIX['A'].x;
            updatePointInMatrix(Letters[length-1], x, y);
        }
        else {
            let c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            let x = MATRIX[Letters[MeasPoints.size-1]].x;
            let y = MATRIX[Letters[c]].y;
            for ( let i=c; i<MeasPoints.size; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].y<y ) y = MATRIX[Letters[i]].y;
            }
            y -= parseFloat(secondWidthWorkTop);
            updatePointInMatrix(Letters[length-3], x, y);

            c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c--;
            x = MATRIX[Letters[c]].x;
            for ( let i=0; i<=c; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].x>x ) x = MATRIX[Letters[i]].x;
            }
            x += parseFloat(firstWidthWorkTop);
            updatePointInMatrix(Letters[length-2], x, y);

            y = MATRIX['A'].y;
            updatePointInMatrix(Letters[length-1], x, y);
        }
    }
    console.log(MATRIX);
}

// проверка на пересечение линий;
const checkCross = () => {
    return false;
}

// вывести изображение объекта из Matrix;
const displayFromMatrix = (shiftXX, shiftYY, direction) => {
    let length = 0;
    let pointCross1 = {'x':0, 'y':0, 'r':0, 'fi':0}, 
        pointCross2 = {'x':0, 'y':0, 'r':0, 'fi':0}, 
        pointInter1 = {'x':0, 'y':0, 'r':0, 'fi':0}, 
        pointInter2 = {'x':0, 'y':0, 'r':0, 'fi':0};
    firstCounter = [];
    secondCounter = [];
    firdCounter = [];
    for ( let key in MATRIX ) length++;
    const widthCanvas = mainDraft.getAttribute('width');
    const heightCanvas = mainDraft.getAttribute('height');
    const vertical = initialBaseSideOrientVertical;
    const firstSide = initialBaseSide;
    const context = mainDraft.getContext('2d');
    context.lineJoin = 'round';
    let minX = MATRIX['A'].x;
    let minY = MATRIX['A'].y;
    let maxX = MATRIX['A'].x;
    let maxY = MATRIX['A'].y;
    for ( let pointKey in MATRIX ) {
        if ( pointKey == Letters[MeasPoints.size] ) break;
        if ( MATRIX[pointKey].x < minX ) minX = MATRIX[pointKey].x;
        if ( MATRIX[pointKey].y < minY ) minY = MATRIX[pointKey].y;
        if ( MATRIX[pointKey].x > maxX ) maxX = MATRIX[pointKey].x;
        if ( MATRIX[pointKey].y > maxY ) maxY = MATRIX[pointKey].y;
    }
    const difX = Math.abs(maxX-minX);
    const difY = Math.abs(maxY-minY);
    const scaleX = (widthCanvas - 20 - shiftXX)/difX;
    const scaleY = (heightCanvas - 40 - shiftYY)/difY;
    scale = (scaleX < scaleY) ? scaleX : scaleY;
    const shiftX = Math.round((widthCanvas - difX*scale)/2);
    const shiftY = Math.round((heightCanvas-difY*scale)/2);

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, widthCanvas, heightCanvas);
    context.fill();
    context.beginPath();
    context.strokeStyle = '#f60018';
    context.fillStyle = '#000000';
    context.lineWidth = '3';
    
    let r = scale*MATRIX['A'].r;
    let x = Math.round(r*Math.cos(MATRIX['A'].fi)) + shiftX;
    let y = heightCanvas - shiftY - Math.round(r*Math.sin(MATRIX['A'].fi));
    context.moveTo(x, y);

    for ( let i=0; i<MeasPoints.size; i++ ) {
        const pointKey = Letters[i];
        const r = scale*MATRIX[pointKey].r;
        const x = Math.round(r*Math.cos(MATRIX[pointKey].fi)) + shiftX;
        const y = heightCanvas - shiftY - Math.round(r*Math.sin(MATRIX[pointKey].fi));
        context.lineTo(x, y);
        context.fillText(pointKey, x + 7, y - 7);
        const displayPoint = {"x": x, "y": y};
        displayCoords[pointKey] = displayPoint;
    }
    context.stroke();
    context.closePath();

    context.beginPath();
    context.strokeStyle = '#3c9dd0';
    const startPoint = MATRIX[Letters[MeasPoints.size-1]];
    r = scale*startPoint.r;
    x = Math.round(r*Math.cos(startPoint.fi)) + shiftX;
    y = heightCanvas - shiftY - Math.round(r*Math.sin(startPoint.fi));
    context.moveTo(x, y);
    for ( let i=MeasPoints.size; i<length; i++ ) {
        const pointKey = Letters[i];
        const r = scale*MATRIX[pointKey].r;
        const x = Math.round(r*Math.cos(MATRIX[pointKey].fi)) + shiftX;
        const y = heightCanvas - shiftY - Math.round(r*Math.sin(MATRIX[pointKey].fi));
        context.lineTo(x, y);
        context.fillText(pointKey, x + 7, y - 7);
        const displayPoint = {"x": x, "y": y};
        displayCoords[pointKey] = displayPoint;
    }
    const finishPoint = MATRIX['A'];
    r = scale*finishPoint.r;
    x = Math.round(r*Math.cos(finishPoint.fi)) + shiftX;
    y = heightCanvas - shiftY - Math.round(r*Math.sin(finishPoint.fi));
    context.lineTo(x, y);

    let point1 = MATRIX[Letters[length-2]];
    let point2;
    let flag = true;
    let dX = trougth*Math.SQRT1_2;
    let dY = trougth*Math.SQRT1_2;
    if ( !(vertical^firstSide) ) dX *= -1;
    if ( direction == 'right' )
        point2 = MATRIX[Letters[length-1]];
    if ( direction == 'left' )
        point2 = MATRIX[Letters[length-3]];
    for ( let i=0; i<MeasPoints.size-1; i++ ) {
        const point3 = MATRIX[Letters[i]];
        const point4 = MATRIX[Letters[i+1]];
        const pointCross = crossPoint(
            {'x':point1.x+dX, 'y':point1.y+dY},
            {'x':point2.x+dX, 'y':point2.y+dY},
            point3,
            point4
        );
        if ( pointCross) {
            if ( segmentLineHasPoint(pointCross, point3, point4) && flag ) {
                flag = false;
                let r = scale*point1.r;
                let x = Math.round(r*Math.cos(point1.fi)) + shiftX;
                let y = heightCanvas - shiftY - Math.round(r*Math.sin(point1.fi));
                context.moveTo(x, y);
                pointInter1.x = point1.x+dX;
                pointInter1.y = point1.y+dY;
                pointInter1.r = Math.sqrt((point1.x+dX)*(point1.x+dX) + (point1.y+dY)*(point1.y+dY));
                pointInter1.fi = calcFi((point1.x+dX), (point1.y+dY));
                r = scale*pointInter1.r;
                x = Math.round(r*Math.cos(pointInter1.fi)) + shiftX;
                y = heightCanvas - shiftY - Math.round(r*Math.sin(pointInter1.fi));
                context.lineTo(x, y);
                pointCross1.x = pointCross.x;
                pointCross1.y = pointCross.y;
                pointCross1.r = Math.sqrt(pointCross.x*pointCross.x + pointCross.y*pointCross.y);
                pointCross1.fi = calcFi(pointCross.x, pointCross.y);
                r = scale*pointCross1.r;
                x = Math.round(r*Math.cos(pointCross1.fi)) + shiftX;
                y = heightCanvas - shiftY - Math.round(r*Math.sin(pointCross1.fi));
                context.lineTo(x, y);
            }
        }
    }
    context.stroke();
    context.closePath();

    let counterNum = 1;
    let point = pointCross1;
    firstCounter = [];
    firstCounter.push(Object.assign({}, MATRIX[Letters[0]]));
    for ( let i=0; i<MeasPoints.size-1; i++ ) {
        const point1 = MATRIX[Letters[i]];
        const point2 = MATRIX[Letters[i+1]];
        if ( segmentLineHasPoint(point, point1, point2) ) {
            if ( counterNum == 1 ) {
                firstCounter.push(Object.assign({}, pointCross1));
                firstCounter.push(Object.assign({}, pointInter1));
                firstCounter.push(Object.assign({}, MATRIX[Letters[length-2]]));
                firstCounter.push(Object.assign({}, MATRIX[Letters[length-1]]));
                secondCounter.push(Object.assign({}, pointInter1));
                secondCounter.push(Object.assign({}, pointCross1));
                counterNum = 2;
            }
        }
        if ( counterNum == 1 )
        firstCounter.push(Object.assign({}, MATRIX[Letters[i+1]]));
        if ( counterNum == 2 )
        secondCounter.push(Object.assign({}, MATRIX[Letters[i+1]]));
    }
    secondCounter.push(Object.assign({}, MATRIX[Letters[length-3]]));
    secondCounter.push(Object.assign({}, MATRIX[Letters[length-2]]));
}

// показать размеры;
const displaySize = () => {
    const vertical = initialBaseSideOrientVertical;
    const firstSide = initialBaseSide;
    const trait = 2;
    const indent = 25;
    const smallIndent = 20;
    const shelf = 50;
    const context = mainDraft.getContext('2d');
    const leftAngleNum = Letters.indexOf(initialLeftAngle);
    let length = 0;
    for ( let pointKey in MATRIX ) length++;

    let firstEdgeMeasur = 0;
    let secondEdgeMeasur = 0;
    let firstEdgePoint = 'A';
    let secondEdgePoint = 'A';
    const transitionPointNum = ( firstSide ) ? (leftAngleNum+1) : leftAngleNum;
    for (let i=0; i<MeasPoints.size; i++) {
        if ( i<transitionPointNum ) {
            let compare=(vertical^firstSide)?(MATRIX[Letters[i]].y-MATRIX[Letters[length-1]].y):(MATRIX[Letters[i]].x-MATRIX[Letters[length-1]].x);
            compare = Math.abs(compare);
            if ( compare>firstEdgeMeasur ) {
                firstEdgeMeasur = compare;
                firstEdgePoint = Letters[i];
            }
        }
        else {
            let compare=(vertical^firstSide)?(MATRIX[Letters[i]].x-MATRIX[Letters[length-2]].x):(MATRIX[Letters[i]].y-MATRIX[Letters[length-2]].y);
            compare = Math.abs(compare);
            if ( compare>secondEdgeMeasur ) {
                secondEdgeMeasur = compare;
                secondEdgePoint = Letters[i];
            }
        }
    }
    firstEdgeMeasur = firstEdgeMeasur.toFixed(2);
    secondEdgeMeasur = secondEdgeMeasur.toFixed(2);

    let minX = displayCoords['A'].x;
    let minY = displayCoords['A'].y;
    let maxX = displayCoords['A'].x;
    let maxY = displayCoords['A'].y;
    for ( let key in displayCoords ) {
        if ( displayCoords[key].x < minX ) minX = displayCoords[key].x;
        if ( displayCoords[key].y < minY ) minY = displayCoords[key].y;
        if ( displayCoords[key].y > maxY ) maxY = displayCoords[key].y;
        if ( displayCoords[key].x > maxX ) maxX = displayCoords[key].x;
    }
    minX -= indent;
    minY -= indent;
    maxY += indent;
    maxX += indent;
    context.strokeStyle = '#3c9dd0';
    context.lineWidth = 1;
    if ( !(vertical^firstSide) ) {
        context.beginPath();
        let x = displayCoords[firstEdgePoint].x;
        let y = displayCoords[firstEdgePoint].y;
        context.moveTo(x, y);
        y = maxY;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[Letters[length-1]].x;
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);
        context.moveTo(x, y);
        y = displayCoords[Letters[length-1]].y;
        context.lineTo(x, y);

        x = displayCoords[Letters[length-3]].x;
        y = displayCoords[Letters[length-3]].y;
        context.moveTo(x, y);
        y = maxY;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = minX + indent;
        context.moveTo(x, y);
        x = maxX - indent;
        context.lineTo(x, y);

        context.textAlign = "center";
        context.textBaseline = "bottom";
        context.font = '12px sans-serif';
        x = (displayCoords[firstEdgePoint].x + displayCoords[Letters[length-1]].x)/2;
        context.fillText(firstEdgeMeasur, x, y);
        x = (displayCoords[Letters[length-2]].x + displayCoords[Letters[length-3]].x)/2;
        let dim = Math.abs(MATRIX[Letters[length-2]].x - MATRIX[Letters[length-3]].x);
        context.fillText(dim.toFixed(2), x, y);

        x = displayCoords['A'].x;
        y = displayCoords['A'].y;
        context.moveTo(x, y);
        x = minX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[Letters[length-2]].x;
        y = displayCoords[Letters[length-2]].y;
        context.moveTo(x, y);
        x = minX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[secondEdgePoint].x;
        y = displayCoords[secondEdgePoint].y;
        context.moveTo(x, y);
        x = minX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        context.moveTo(x, y);
        y = displayCoords[Letters[length-1]].y;
        context.lineTo(x, y);

        context.stroke();
        context.closePath();

        context.rotate(-Math.PI/2);
        x = -Math.round((displayCoords[Letters[length-1]].y + displayCoords[Letters[length-2]].y)/2);
        y = minX;
        dim = Math.abs(MATRIX[Letters[length-1]].y - MATRIX[Letters[length-2]].y);
        context.fillText(dim.toFixed(2), x, y);
        x = -Math.round((displayCoords[secondEdgePoint].y + displayCoords[Letters[length-2]].y)/2);
        context.fillText(secondEdgeMeasur, x, y);
        context.rotate(Math.PI/2);
    }
    else {
        context.beginPath();

        let x = displayCoords[Letters[length-1]].x;
        let y = displayCoords[Letters[length-1]].y;
        context.moveTo(x, y);
        y = maxY;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[Letters[length-3]].x;
        y = displayCoords[Letters[length-3]].y;
        context.moveTo(x, y);
        y = maxY;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[secondEdgePoint].x;
        y = displayCoords[secondEdgePoint].y;
        context.moveTo(x, y);
        y = maxY;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        context.moveTo(x, y);
        x = displayCoords[Letters[length-1]].x;
        context.lineTo(x, y);

        context.textAlign = "center";
        context.textBaseline = "bottom";
        context.font = '12px sans-serif';
        x = (displayCoords[Letters[length-1]].x + displayCoords[Letters[length-2]].x)/2;
        let dim = Math.abs(MATRIX[Letters[length-1]].x-MATRIX[Letters[length-2]].x);
        context.fillText(dim.toFixed(2), x, y);
        x = (displayCoords[Letters[length-3]].x + displayCoords[secondEdgePoint].x)/2;
        dim = Math.abs(MATRIX[Letters[length-3]].x - MATRIX[secondEdgePoint].x);
        context.fillText(dim.toFixed(2), x, y);

        x = displayCoords[firstEdgePoint].x;
        y = displayCoords[firstEdgePoint].y;
        context.moveTo(x, y);
        x = minX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[Letters[length-1]].x;
        y = displayCoords[Letters[length-1]].y;
        context.moveTo(x, y);
        x = minX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[Letters[length-3]].x;
        y = displayCoords[Letters[length-3]].y;
        context.moveTo(x, y);
        x = minX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        context.moveTo(x, y);
        y = displayCoords[firstEdgePoint].y;
        context.lineTo(x, y);

        context.rotate(-Math.PI/2);
        x = -Math.round((displayCoords[Letters[length-3]].y + displayCoords[Letters[length-2]].y)/2);
        y = minX;
        dim = Math.abs(MATRIX[Letters[length-3]].y - MATRIX[Letters[length-2]].y);
        context.fillText(dim.toFixed(2), x, y);
        x = -Math.round((displayCoords[firstEdgePoint].y + displayCoords[Letters[length-1]].y)/2);
        context.fillText(firstEdgeMeasur, x, y);
        context.rotate(Math.PI/2);

        context.stroke();
        context.closePath();
    }
}

// вывод чертежей столешниц;
const displayFrom = (array, canvas, table) => {
    let Points = [];
    const widthCanvas = canvas.getAttribute('width');
    const heightCanvas = canvas.getAttribute('height');
    const field = 20;
    const dimTextWidth = 50;
    const distDimLine = 20;
    const serif = 2;
    let dimLineVerticalQuant = array.length;
    let shiftX = 2*field + dimTextWidth + distDimLine*array.length;
    let shiftY = 2*field + 2*distDimLine*array.length;
    for ( let i=0; i<array.length; i++ ) {
        for ( let j=0; j<i; j++ ) {
            if (( Math.round(array[i].y-array[j].y)==0) && Math.round(array[i].y)!=0 ) {
                shiftX -= distDimLine;
                shiftY -= distDimLine;
                --dimLineVerticalQuant;
                break;
            }   
        }
    }
    for ( let i=0; i<array.length; i++ ) {
        for ( let j=0; j<i; j++ ) {
            if ( (Math.round(array[i].x-array[j].x)==0) && Math.round(array[i].x)!=0 ) {
                shiftY -= distDimLine;
                break;
            }
        }
    }
    for ( let i=0; i<array.length; i++ ) {
        if ( Math.round(array[i].y)==0 )
        shiftX -= distDimLine;
        if ( Math.round(array[i].x)==0 )
        shiftY -= distDimLine;
    }
    const context = canvas.getContext('2d');
    let difX = 0, difY = 0;
    for ( let i in array ) {
        if ( array[i].x>difX ) difX = array[i].x;
        if ( array[i].y>difY ) difY = array[i].y;
    }
    const scaleX = (widthCanvas-shiftX)/difX;
    const scaleY = (heightCanvas-shiftY)/difY;
    const scale = (scaleX<scaleY) ? scaleX : scaleY;
    shiftX = Math.round((widthCanvas-scale*difX)/2 + 2*field);
    shiftY = Math.round(heightCanvas-scale*difY-field);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, widthCanvas, heightCanvas);
    context.fill();

    context.beginPath();
    context.strokeStyle = '#f60018';
    context.fillStyle = '#000000';
    context.lineWidth = '3';
    let startPointX = 32000, startPointIndex = 0;
    for ( let i in array ) {
        const r = scale*array[i].r;
        const fi = array[i].fi;
        const x = Math.round(r*Math.cos(fi) + shiftX);
        const y = Math.round(heightCanvas - r*Math.sin(fi) - shiftY);
        Points.push({'x':x, 'y':y});
        if ( i==0 ) {
            context.moveTo(x, y);
            continue;
        }
        context.lineTo(x, y);
        if ( array[i].y == 0 ) {
            if ( array[i].x<startPointX ) {
                startPointX = array[i].x;
                startPointIndex = i;
            }
        }
    }
    context.closePath();
    context.stroke();

    let lastPartArray = array.splice(0, startPointIndex);
    lastPartArray.forEach(item => { array.push({'x':item.x, 'y':item.y}); });
    array.forEach((item, i) => { item.point = Letters[i] });

    lastPartArray = Points.splice(0, startPointIndex);
    lastPartArray.forEach(item => { Points.push({'x':item.x, 'y':item.y}); });
    let signY = 10, signX = 5;
    for (let i=0; i<Points.length; i++) {
        if ( i==0 ) {
            if ( Points[Points.length-1].x > Points[i].x ) signX = -10;
            if ( Points[parseInt(i)+1].y > Points[i].y ) signY = -5;
        }
        else {
            if ( Points[i-1].x > Points[i].x ) signX = -10;
            if ( i != Points.length-1 )
            if ( Points[parseInt(i)+1].y<Points[i].y ) signY = -5;
        }
        context.fillText(Letters[i], Points[i].x+signX, Points[i].y+signY);
        Points[i].point = Letters[i];
    }

    let PointsSortByX = [];
    let PointsSortByY = [];
    Points.sort((a, b) => a.x-b.x).forEach(item => {
        PointsSortByX.push({
            'point': item.point,
            'x': item.x,
            'y': item.y,
        });
    });
    Points.sort((a, b) => b.y-a.y).forEach(item => {
        PointsSortByY.push({
            'point': item.point,
            'x': item.x,
            'y': item.y,
        });
    });
    context.beginPath();
    context.strokeStyle = '#3c9dd0';
    context.lineWidth = '1';
    let n = 0; // количество размерных линий;
    shiftX -= field;
    shiftY -= field;
    PointsSortByY.forEach((item, i) => {
        let flag = true;
        for (let j=0; j<i; j++) {
            if ( PointsSortByY[j].y==PointsSortByY[i].y )
            flag = false;
        }
        if ( flag && i>0 ) {
            const dX = (n+1)*distDimLine; 
            context.moveTo(item.x, item.y);
            let x = PointsSortByX[0].x-dX;
            let y = item.y;
            context.lineTo(x, y);
            context.moveTo(x+serif, y+serif);
            context.lineTo(x-serif, y-serif);
            context.moveTo(x, y);
            y = PointsSortByY[0].y+(dimLineVerticalQuant-n)*distDimLine;
            context.lineTo(x, y);
            context.textAlign = 'right';
            context.textBaseline = 'center';
            const point = item.point;
            const currPoint = array.find(item => item.point == point);
            const str = item.point + ':' + currPoint.y.toFixed(2);
            context.fillText(str, x-3, y-3);
            x -= dimTextWidth;
            context.lineTo(x, y);
            x = PointsSortByX[0].x-dX;
            y = PointsSortByY[0].y;
            context.moveTo(x+serif, y+serif);
            context.lineTo(x-serif, y-serif);
            ++n;
        }
    });
    context.moveTo(PointsSortByY[0].x, PointsSortByY[0].y);
    context.lineTo(PointsSortByX[0].x - n*distDimLine, PointsSortByY[0].y);

    const dYBase = dimLineVerticalQuant*distDimLine;
    n = 0;
    PointsSortByX.forEach((item, i) => {
        let flag = true;
        for (let j=0; j<i; j++) {
            if ( PointsSortByX[j].x==PointsSortByX[i].x)
            flag = false;
        }
        if ( flag && i>0 ) {
            let dY = dYBase + (n+1)*distDimLine;
            context.moveTo(item.x, item.y);
            let x = item.x;
            let y = PointsSortByY[0].y+dY;
            context.lineTo(x, y);
            context.moveTo(x+serif, y+serif);
            context.lineTo(x-serif, y-serif);
            context.moveTo(x, y);
            x = PointsSortByX[0].x - dimTextWidth;
            context.lineTo(x, y);
            context.textAlign = 'right';
            context.textBaseline = 'center';
            const point = item.point;
            const currPoint = array.find(item => item.point == point);
            const str = item.point + ':' + currPoint.x.toFixed(2);
            context.fillText(str, x+dimTextWidth-3, y-3);
            context.lineTo(x, y);
            x = PointsSortByX[0].x;
            context.moveTo(x+serif, y+serif);
            context.lineTo(x-serif, y-serif);
            n++;
        }
    });
    const dY = dYBase + n*distDimLine;
    context.moveTo(PointsSortByX[0].x, PointsSortByY[0].y);
    context.lineTo(PointsSortByX[0].x, PointsSortByY[0].y + dY);
    context.closePath();

    context.stroke();
    table.textContent = '';
    array.forEach(item => {
        const point = item.point;
        const x = item.x.toFixed(2);
        const y = item.y.toFixed(2);
        table.innerHTML += `
            <tr>
                <td>${point}</td>
                <td>${x}</td>
                <td>${y}</td>
            </tr
        `;
    });
}

// точка пересечения двух линий;
const crossPoint = (point1, point2, point3, point4) => {
    if ( point1.x == point2.x ) {
        if ( (point3.x.toFixed(5) == point4.x.toFixed(5) ) )
        return false;
        const k2 = (point3.y-point4.y)/(point3.x-point4.x);
        const b2 = (point3.x*point4.y-point4.x*point3.y)/(point3.x-point4.x);
        const y = k2*point1.x + b2;
        const result = {'x':point1.x, 'y':y};
        return result;
    }
    const k1 = (point1.y-point2.y)/(point1.x-point2.x);
    const b1 = (point1.x*point2.y-point2.x*point1.y)/(point1.x-point2.x);
    if ( point3.x.toFixed(5) == point4.x.toFixed(5) ) {
        const y = k1*point3.x + b1;
        const result = {'x':point3.x, 'y':y};
        return result;
    }
    const k2 = (point3.y-point4.y)/(point3.x-point4.x);
    const b2 = (point3.x*point4.y-point4.x*point3.y)/(point3.x-point4.x);
    if ( k1 == k2 ) return false;
    const x = (b2-b1)/(k1-k2);
    const y = (k1*b2-k2*b1)/(k1-k2);
    const result = {'x':x, 'y':y};
    return result;
}

// принадлежит ли точка отрезку;
const segmentLineHasPoint = (point, point1, point2) => {
    const x = point.x;
    const y = point.y;
    const x1 = point1.x;
    const y1 = point1.y; 
    const x2 = point2.x;
    const y2 = point2.y;
    if ( (x1.toFixed(5) == x2.toFixed(5)) && (x1.toFixed(5) == x.toFixed(5)) ) {
        if ( ((y1<=y) && (y<=y2)) || ((y2<=y) && (y<=y1)) )
        return true;
        return false;
    }
    if ( !(((x1<=x) && (x<=x2)) || ((x2<=x) && (x<=x1))) )
    return false;
    const k = (y1-y2)/(x1-x2);
    const b = (x1*y2-x2*y1)/(x1-x2);
    const yCross = k*x + b;
    if ( yCross.toFixed(5) == y.toFixed(5) )
    return true;
    return false;
}

measuringCanvas.addEventListener('mousedown', (mousedown) => {
    const clientRect = measuringCanvas.getBoundingClientRect();
    const clickX = parseInt(mousedown.clientX - clientRect.left);
    const clickY = parseInt(mousedown.clientY - clientRect.top);
    if (Step == 0) {
        if ( !initialLeftAngle ) {
            if ( (Math.abs(clickX - 40) < 10)&&(Math.abs(clickY - 40) < 10) ) {
                pointByCoords(40, 40, '#ff0000');
                MeasPoints.set(
                    lettersMap.get(MeasPoints.size), {modul: 0, move: 0, angle: 0, x: 40, y: 40}
                );
                initialLeftAngle = lettersMap.get(MeasPoints.size-1);
                return;
            }
            if ( (Math.abs(clickX - 940) < 10)&&(Math.abs(clickY - 40) < 10) ) {
                pointByCoords(940, 40, '#ff0000');
                MeasPoints.set(
                    lettersMap.get(MeasPoints.size), {modul: 0, move: 0, angle: 0, x: 940, y: 40}
                );
                initialLeftAngle = lettersMap.get(MeasPoints.size-1);
                return;
            }
        }
        if ( Math.abs(clickX - 40) < 10 ) {
            pointByCoords(40, clickY, '#ff0000');
            MeasPoints.set(
                lettersMap.get(MeasPoints.size), {modul: 0, move: 0, angle: 0, x: 40, y: clickY}
            );
            return;
        }
        if ( Math.abs(clickX - 940) < 10 ) {
            pointByCoords(940, clickY, '#ff0000');
            MeasPoints.set(
                lettersMap.get(MeasPoints.size), {modul: 0, move: 0, angle: 0, x: 940, y: clickY}
            );
            return;
        }
        if ( Math.abs(clickY - 40) < 10 ) {
            pointByCoords(clickX, 40, '#ff0000');
            MeasPoints.set(
                lettersMap.get(MeasPoints.size), {modul: 0, move: 0, angle: 0, x: clickX, y: 40}
            );
            return;
        }
        pointByCoords(clickX, clickY, '#ff0000');
        MeasPoints.set(
            lettersMap.get(MeasPoints.size), {modul: 0, move: 0, angle: 0, x: clickX, y: clickY}
        );
    }
});

// вычисление сторон для определения погрешности;
const completeVerificSide = () => {
    let verificSides = [];
    const topCount = Object.keys(MATRIX).length;
    for (let i=0; i<topCount; i++) {
        for (let j=topCount-1; j>i+1; j--) {
            const x1 = MATRIX[Letters[i]].x;
            const x2 = MATRIX[Letters[j]].x;
            const y1 = MATRIX[Letters[i]].y;
            const y2 = MATRIX[Letters[j]].y;
            const value = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)).toFixed(2);
            const option = new Option(Letters[i] + Letters[j], value);
            verific.options[verific.options.length] = option;
        }
    }
}

// показать погрешность;
const showVerific = () => {
    let dl = verific.value - verificValue.value;
    dl = dl.toFixed(2);
    if ( dl>0 ) errorMsg.textContent = 'Столешница меньше на ' + Math.abs(dl) + 'mm.';
    if ( dl<0 ) errorMsg.textContent = 'Столешница больше на ' + Math.abs(dl) + 'mm.';
    if ( dl == 0 ) errorMsg.textContent = 'Точный замер.';
}

// поворот чертежа;
const rotateBtnClick = () => {
    initialBaseSideOrientVertical = !initialBaseSideOrientVertical;
    renderDraw();
}

// контроль ввода чисел;
inputMeasure.addEventListener('input', (event) => {
    if ( isNaN(event.data) && (event.data != '.') ) {
        const str = event.target.value;
        event.target.value = '';
        for ( let i=0; i < (str.length-1); i++  )
        event.target.value += str[i];
    }
});

stepBy();

