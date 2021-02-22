const initialSettingsTypes = document.querySelectorAll('.initial-settings-type__btn');
const initialBodyBase = document.querySelector('.initial-body-base');
const initialBodyExtend = document.querySelector('.initial-body-extend');
const initialType = document.querySelector('.initial__type');
const indataRowLabel = document.querySelector('.indata-row__label');
const indataRowNext = document.querySelector('.indata-row__next');
const indataRowPrev = document.querySelector('.indata-row__prev');
const indataRowValue = document.querySelector('.indata-row__value');
const initialTopInput = document.querySelector('.initial-top__input');
const initialImpactContainer = document.querySelector('.initial-impact');
const initialRightAngle = document.querySelector('.initial-right-angle__value');
const initialLeftAngle = document.querySelector('.initial-left-angle__value');
const initialBaseSideSelect = document.querySelector('.initial-base-side__select');
const initialBaseSideOrient = document.querySelector('.initial-base-side-orient__value');
const initialBaseCounter = document.querySelector('.initial-base-counter__value');
const initialNext = document.querySelector('.initial__next');
const initialDepths = document.querySelectorAll('.initial-depth__input');
const initialOverhangs = document.querySelectorAll('.initial-overhang__input');
const mainDraft = document.querySelector('.main-draft');
const firstDraft = document.querySelector('.first-draft');
const secondDraft = document.querySelector('.second-draft');
const firdDraft = document.querySelector('.fird-draft');
const finalTablesFirstBody = document.querySelector('.final-tables-first-body');
const finalTablesSecondBody = document.querySelector('.final-tables-second-body');
const finalTablesFirdBody = document.querySelector('.final-tables-fird-body');

const Letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const Directions = {'right':'Первая', 'left':'Третья', 'forward':'Вторая', 'reverse':'1 + 3'};
let COORDS = [];
let MATRIX = [];
let displayCoords = [];
let nonImpactPoints = [];
let firstCounter = [];
let secondCounter = [];
let firdCounter = [];

let dieX = 1200;
let dieY = 900;

let firstDepth = 560;
let secondDepth = 560;
let firdDepth = 560;
let firstOverhang = 40;
let secondOverhang = 40;
let firdOverhang = 40;
let trougth = 40;

location.hash = '#initial';

// сохранение точки замера;
const saveInputData = (point, type, value) => {
    if (typeof COORDS[point] == 'undefined')
    COORDS[point] = {'modul':0, 'move':0, 'angle':0};
    COORDS[point][type] = value;
    if ( point != 'A' ) {
        let prevPoint = 'A';
        let i = 0;
        while (i<Letters.length) {
            prevPoint = Letters[i++];
            if (Letters[i] == point) break;
        }
        const a = COORDS[point].move;
        const b = COORDS[point].modul;
        const c = COORDS[prevPoint].modul;
        COORDS[point].angle = (-1)*calcAngle(a, b, c);
    }
    else COORDS[point].angle = 0;
    // последняя точка;
    if ( point == Letters[initialTopInput.value-1] ) {
        // сначала модули;
        if (initialType.classList.contains('modul-before')) {
            if ( type == 'modul' ) createIndataRowLabel('B', 'move');
            else return true;
        }
        // попеременный ввод;
        else {
            if ( type == 'modul' ) createIndataRowLabel(point, 'move');
            else return true;
        }
    }
    // непоследняя точка;
    else {
        // сначала модули;
        if (initialType.classList.contains('modul-before')) {
            let pointNum = 0;
            for (pointNum = 0; pointNum<Letters.length; pointNum++) {
                if ( Letters[pointNum] == point ) break;
            }
            if ( type == 'modul' ) createIndataRowLabel(Letters[++pointNum], 'modul');
            else createIndataRowLabel(Letters[++pointNum], 'move');
        }
        else {
            if ( type == 'modul' && point != 'A' ) createIndataRowLabel(point, 'move');
            else {
                let pointNum = 0;
                for (pointNum = 0; pointNum<Letters.length; pointNum++) {
                    if ( Letters[pointNum] == point ) break;
                }
                createIndataRowLabel(Letters[++pointNum], 'modul');
            }
        }
    }
}

// расчет угла по модулю и перемещению;
const calcAngle = (a, b, c) => {
    a = parseFloat(a);
    b = parseFloat(b);
    c = parseFloat(c);
    if ( (a*b*c == 0) || (b+c<=a) || (a+c<=b) || (a+b<=c) ) {
        return 0;
    }
    let angleABC = 0;
    let cos = (b*b + c*c - a*a)/(2*b*c);
    let angle = Math.acos(cos)/Math.PI*180;
    return angle;
}

// надпись для ввода замера;
const createIndataRowLabel = (point, type) => {
    let content = 'O'+ point + '=';
    if (type == 'move' ) {
        indataRowNext.classList.remove('modul-input');
        let i = 0;
        while (i<=Letters.length) {
            if (Letters[++i] == point) break;
        }
        content = Letters[i-1] + point + '=';
    }
    else indataRowNext.classList.add('modul-input');
    indataRowNext.setAttribute('data-point', point);
    indataRowLabel.textContent = content;
    indataRowValue.value = COORDS[point][type];
}

// проверка введенных данных;
const testInputData = () => {
    if ( COORDS['A'].modul == 0 ) {
        alert('Ошибка расположения точки А');
        return false;
    }
    for ( let point in COORDS ) {
        if ( point == Letters[initialTopInput.value] ) return true;
        if ( point != 'A' ) {
            let prevPoint = 'A';
            for ( let i=1; i<Letters.length; i++ ) {
                if (Letters[i] == point) break;
                prevPoint = Letters[i];
            }
            const a = parseFloat(COORDS[prevPoint].modul);
            const b = parseFloat(COORDS[point].move);
            const c = parseFloat(COORDS[point].modul);
            if ( (a+b)<=c || (a+c)<=b || (b+c)<=a ) {
                alert('Ошибка взаиморасположения точек ' + prevPoint + ' и ' + point);
                return false;
            }
        }
    }
    return true;
}

// создание массива Matrix, переход в декартову и полярную СК;
const baseToDecart = () => {
    let Fi = 0;
    for ( let pointKey in COORDS ) {
        const r = COORDS[pointKey].modul;
        Fi += COORDS[pointKey].angle/180*Math.PI;
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
    const firdWidthWorkTop = parseInt(firdDepth) + parseInt(firdOverhang);

    let leftAngleNum = 0;
    let rightAngleNum = 0;
    for (let i=0; i<Letters.length; i++) {
        if ( Letters[i] == initialLeftAngle.textContent ) leftAngleNum = i;
        if ( Letters[i] == initialRightAngle.textContent ) rightAngleNum = i;
    }
    let length = 0;
    for ( let pointKey in MATRIX ) length++;

    if ( initialBaseSideSelect.classList.contains('first-side') ) {
        if (initialBaseSideOrient.classList.contains('vertical')) {
            let x = parseFloat(MATRIX['A'].x) + parseFloat(firstWidthWorkTop);
            let y = parseFloat(MATRIX['A'].y);
            updatePointInMatrix(Letters[length-1], x, y);

            let c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            y = parseFloat(MATRIX[Letters[c]].y);
            for ( let i=leftAngleNum; i<=rightAngleNum; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].y<y ) y = MATRIX[Letters[i]].y;
            }
            y -= secondWidthWorkTop;
            updatePointInMatrix(Letters[length-2], x, y);

            c = rightAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            x = parseFloat(MATRIX[Letters[c]].x);
            for ( let i=rightAngleNum; i<initialTopInput.value; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].x<x ) x = MATRIX[Letters[i]].x;
            }
            x-= firdWidthWorkTop;
            updatePointInMatrix(Letters[length-3], x, y);

            y = parseFloat(MATRIX[Letters[length-5]].y);
            updatePointInMatrix(Letters[length-4], x, y);
        }
        else {
            let x = parseFloat(MATRIX['A'].x);
            let y = parseFloat(MATRIX['A'].y) - parseFloat(firstWidthWorkTop);
            updatePointInMatrix(Letters[length-1], x, y);

            c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            x = MATRIX[Letters[c]].x;
            for (let i=leftAngleNum; i<=rightAngleNum; i++) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].x<x ) x = MATRIX[Letters[i]].x; 
            }
            x -= parseFloat(secondWidthWorkTop);
            updatePointInMatrix(Letters[length-2], x, y);

            c = rightAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            y = MATRIX[Letters[c]].y;
            for (let i=rightAngleNum; i<initialTopInput.value; i++) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].y>y ) y = MATRIX[Letters[i]].y;
            }
            y += parseFloat(firdWidthWorkTop);
            updatePointInMatrix(Letters[length-3], x, y);

            x = MATRIX[Letters[initialTopInput.value-1]].x;
            updatePointInMatrix(Letters[length-4], x, y);
        }
    }
    else {
        if (initialBaseSideOrient.classList.contains('vertical')) {
            let x = MATRIX[Letters[initialTopInput.value-1]].x - parseFloat(firdWidthWorkTop);
            let y = MATRIX[Letters[initialTopInput.value-1]].y;
            updatePointInMatrix(Letters[length-4], x, y);

            c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            y = MATRIX[Letters[c]].y;
            for ( let i=leftAngleNum; i<=rightAngleNum; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].y<y ) y = MATRIX[Letters[i]].y;
            }
            y -= parseFloat(secondWidthWorkTop);
            updatePointInMatrix(Letters[length-3], x, y);

            x = MATRIX['A'].x;
            for ( let i=0; i<=leftAngleNum; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].x>x ) x = MATRIX[Letters[i]].x;
            }
            x += parseFloat(firstWidthWorkTop);
            updatePointInMatrix(Letters[length-2], x, y);

            y = MATRIX['A'].y;
            updatePointInMatrix(Letters[length-1], x ,y);
        }
        else {
            let x = MATRIX[Letters[initialTopInput.value-1]].x;
            let y = MATRIX[Letters[initialTopInput.value-1]].y + parseFloat(firdWidthWorkTop);
            updatePointInMatrix(Letters[length-4], x, y);

            c = leftAngleNum;
            while (nonImpactPoints.includes(Letters[c])) c++;
            x = MATRIX[Letters[c]].x;
            for ( let i=leftAngleNum; i<=rightAngleNum; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].x<x ) x = MATRIX[Letters[i]].x;
            }
            x -= parseFloat(secondWidthWorkTop);
            updatePointInMatrix(Letters[length-3], x, y);

            y = MATRIX['A'].y;
            for ( let i=0; i<=leftAngleNum; i++ ) {
                if ( nonImpactPoints.includes(Letters[i]) ) continue;
                if ( MATRIX[Letters[i]].y<y ) y = MATRIX[Letters[i]].y;
            }
            y -= parseFloat(firstWidthWorkTop);
            updatePointInMatrix(Letters[length-2], x, y);

            x = MATRIX['A'].x;
            updatePointInMatrix(Letters[length-1], x ,y);
        }
    }
}

// показать размеры;
const displaySize = () => {
    const vertical = initialBaseSideOrient.classList.contains('vertical');
    const trait = 2;
    const indent = 25;
    const smallIndent = 20;
    const shelf = 50;
    const context = mainDraft.getContext('2d');
    let leftAngleNum = 0;
    let rightAngleNum = 0;
    for (let i=0; i<Letters.length; i++) {
        if ( Letters[i] == initialLeftAngle.textContent ) leftAngleNum = i;
        if ( Letters[i] == initialRightAngle.textContent ) rightAngleNum = i;
    }
    let length = 0;
    for ( let pointKey in MATRIX ) length++;

    let firstEdgeMeasur = 0;
    let secondEdgeMeasur = 0;
    let firdEdgeMeasur = 0;
    let firstEdgePoint = 'A';
    let secondEdgePoint = 'A';
    let firdEdgePoint = 'A';
    for (let i=0; i<initialTopInput.value; i++) {
        if ( i<leftAngleNum ) {
            if ( vertical ) {
                const compare = MATRIX[Letters[i]].x-MATRIX[Letters[length-1]].x;
                if ( Math.abs(compare)>firstEdgeMeasur ) {
                    firstEdgeMeasur = Math.abs(compare);
                    firstEdgePoint = Letters[i];
                }
            }
            else {
                const compare = MATRIX[Letters[i]].y-MATRIX[Letters[length-1]].y;
                if ( Math.abs(compare)>firstEdgeMeasur ) {
                    firstEdgeMeasur = Math.abs(compare);
                    firstEdgePoint = Letters[i];
                }
            }
            continue;
        }
        if ( i<rightAngleNum) {
            if ( vertical ) {
                const compare = MATRIX[Letters[i]].y-MATRIX[Letters[length-2]].y;
                if ( Math.abs(compare)>secondEdgeMeasur ) {
                    secondEdgeMeasur = Math.abs(compare);
                    secondEdgePoint = Letters[i];
                }
            }
            else {
                const compare = MATRIX[Letters[i]].x-MATRIX[Letters[length-2]].x;
                if ( Math.abs(compare)>secondEdgeMeasur ) {
                    secondEdgeMeasur = Math.abs(compare);
                    secondEdgePoint = Letters[i];
                }
            }
            continue;
        }
        if ( vertical ) {
            const compare = MATRIX[Letters[i]].x-MATRIX[Letters[length-3]].x;
            if ( Math.abs(compare)>firdEdgeMeasur ) {
                firdEdgeMeasur = Math.abs(compare);
                firdEdgePoint = Letters[i];
            }
        }
        else {
            const compare = MATRIX[Letters[i]].y-MATRIX[Letters[length-3]].y;
            if ( Math.abs(compare)>firdEdgeMeasur ) {
                firdEdgeMeasur = Math.abs(compare);
                firdEdgePoint = Letters[i];
            }
        }
        continue;
    }
    firstEdgeMeasur = firstEdgeMeasur.toFixed(2);
    secondEdgeMeasur = secondEdgeMeasur.toFixed(2);
    firdEdgeMeasur = firdEdgeMeasur.toFixed(2);

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
    if ( vertical ) {
        context.beginPath();
        let x = displayCoords[firstEdgePoint].x;
        let y = displayCoords[firstEdgePoint].y;
        context.moveTo(x, y);
        y = maxY;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[Letters[length-1]].x;
        y = displayCoords[Letters[length-1]].y;
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

        x = displayCoords[firdEdgePoint].x;
        y = displayCoords[firdEdgePoint].y;
        context.moveTo(x, y);
        y = maxY;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);
        context.moveTo(x, y);
        x = displayCoords[firstEdgePoint].x;
        context.lineTo(x, y);

        context.textAlign = "center";
        context.textBaseline = "bottom";
        context.font = '12px sans-serif';
        x = (displayCoords[firstEdgePoint].x + displayCoords[Letters[length-1]].x)/2;
        context.fillText(firstEdgeMeasur, x, y);
        x = (displayCoords[Letters[length-2]].x + displayCoords[Letters[length-3]].x)/2;
        let dim = Math.abs(MATRIX[Letters[length-2]].x - MATRIX[Letters[length-3]].x);
        context.fillText(dim.toFixed(2), x, y);
        x = (displayCoords[Letters[length-3]].x + displayCoords[firdEdgePoint].x)/2;
        context.fillText(firdEdgeMeasur, x, y);

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

        x = minX;
        y = displayCoords[secondEdgePoint].y;
        context.moveTo(x, y);
        y = displayCoords[Letters[length-1]].y;
        context.lineTo(x, y);

        x = displayCoords[Letters[length-3]].x;
        y = displayCoords[Letters[length-3]].y;
        context.moveTo(x, y);
        x = maxX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[Letters[length-4]].x;
        y = displayCoords[Letters[length-4]].y;
        context.moveTo(x, y);
        x = maxX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = maxX;
        y = displayCoords[Letters[length-3]].y;
        context.moveTo(x, y);
        y = displayCoords[Letters[length-4]].y;
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
        x = -Math.round((displayCoords[Letters[length-3]].y + displayCoords[Letters[length-4]].y)/2);
        y = maxX;
        dim = Math.abs(MATRIX[Letters[length-3]].y - MATRIX[Letters[length-4]].y);
        context.fillText(dim.toFixed(2), x, y);
        context.rotate(Math.PI/2);
    }
    else {
        context.beginPath();

        let x = displayCoords[Letters[length-5]].x;
        let y = displayCoords[Letters[length-5]].y;
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
        x = displayCoords[Letters[length-5]].x;
        context.lineTo(x, y);

        x = displayCoords[Letters[length-1]].x;
        y = displayCoords[Letters[length-1]].y;
        context.moveTo(x, y);
        y = minY;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[Letters[length-2]].x;
        y = displayCoords[Letters[length-2]].y;
        context.moveTo(x, y);
        y = minY;
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
        y = maxY;
        x = (displayCoords[Letters[length-3]].x + displayCoords[Letters[length-4]].x)/2;
        dim = Math.abs(MATRIX[Letters[length-3]].x - MATRIX[Letters[length-4]].x);
        context.fillText(dim.toFixed(2), x, y);
        x = (displayCoords[Letters[length-3]].x + displayCoords[secondEdgePoint].x)/2;
        context.fillText(secondEdgeMeasur, x, y);

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

        x = displayCoords[Letters[length-4]].x;
        y = displayCoords[Letters[length-4]].y;
        context.moveTo(x, y);
        x = minX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        x = displayCoords[firdEdgePoint].x;
        y = displayCoords[firdEdgePoint].y;
        context.moveTo(x, y);
        x = minX;
        context.lineTo(x, y);
        context.moveTo(x-trait, y+trait);
        context.lineTo(x+trait, y-trait);

        context.moveTo(x, y);
        y = displayCoords[firstEdgePoint].y;
        context.lineTo(x, y);

        context.rotate(-Math.PI/2);
        x = -Math.round((displayCoords[Letters[length-5]].y + displayCoords[Letters[length-4]].y)/2);
        y = minX;
        context.fillText(firdEdgeMeasur, x, y);
        x = -Math.round((displayCoords[Letters[length-3]].y + displayCoords[Letters[length-2]].y)/2);
        dim = Math.abs(MATRIX[Letters[length-3]].y - MATRIX[Letters[length-2]].y);
        context.fillText(dim.toFixed(2), x, y);
        x = -Math.round((displayCoords[firstEdgePoint].y + displayCoords[Letters[length-2]].y)/2);
        context.fillText(firdEdgeMeasur, x, y);
        context.rotate(Math.PI/2);

        context.stroke();
        context.closePath();
    }
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

// проверка на пересечение линий;
const checkCross = () => {
    let length = 0;
    for ( let pointKey in MATRIX ) length++;
    for ( let i=0; i<length; i++ ) {
        const n = ((i+1)==length) ? 0 : (i+1);
        const x11 = MATRIX[Letters[i]].x;
        const y11 = MATRIX[Letters[i]].y;
        const x12 = MATRIX[Letters[n]].x;
        const y12 = MATRIX[Letters[n]].y;
        if ( x11==x12 ) {
            const x = x11;
            for (let j=i; j<length; j++) {
                if ( Math.abs(i-j)<2 ) continue;
                if ( (i==0) && (j==(length-1)) ) continue;
                const m = ((j+1)==length) ? 0 : (j+1);
                const x21 = MATRIX[Letters[j]].x;
                const y21 = MATRIX[Letters[j]].y;
                const x22 = MATRIX[Letters[m]].x;
                const y22 = MATRIX[Letters[m]].y;
                if ( x21==x22 ) {
                    if ( x21==x ) {
                        console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                        return true;
                    }
                    continue;
                }
                const k2 = (y21-y22)/(x21-x22);
                const b2 = (x21*y22-x22*y21)/(x21-x22);
                const y = k2*x + b2;
                if ( (x>=x21) && (x<=x22 ) ) {
                    if ( (y>=y21) && (y<=y22) ) {
                        console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                        return true;
                    }
                    if ( (y>=y22) && (y<=y21) ) {
                        console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                        return true;
                    }
                }
                if ( (x>=x22) && (x<=x21 ) ) {
                    if ( (y>=y11) && (y<=y12) ) {
                        console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                        return true;
                    }
                    if ( (y>=y12) && (y<=y11) ) {
                        console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                        return true;
                    }
                }
            }
            continue;
        }
        const k1 = (y11-y12)/(x11-x12);
        const b1 = (x11*y12-x12*y11)/(x11-x12);
        for (let j=i; j<length; j++) {
            if ( Math.abs(i-j)<2 ) continue;
            if ( (i==0) && (j==(length-1)) ) continue;
            const m = ((j+1)==length) ? 0 : (j+1);
            const x21 = MATRIX[Letters[j]].x;
            const y21 = MATRIX[Letters[j]].y;
            const x22 = MATRIX[Letters[m]].x;
            const y22 = MATRIX[Letters[m]].y;
            if ( x21 == x22 ) {
                const x = x21;
                const y = k1*x+b1;
                if ( (x>=x11) && (x<=x12) ) {
                    if ( (y>=y21) && (y<=y22) ) {
                        console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                        return true;
                    }
                    if ( (y>=y22) && (y<=y21) ) {
                        console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                        return true;
                    }
                }
                if ( (x>=x12) && (x<=x11) ) {
                    if ( (y>=y21) && (y<=y22) ) {
                        console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                        return true;
                    }
                    if ( (y>=y22) && (y<=y21) ) {
                        console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                        return true;
                    }
                }
                continue;
            }
            const k2 = (y21-y22)/(x21-x22);
            if ( k2 == k1 ) continue;
            const b2 = (x21*y22-x22*y21)/(x21-x22);
            const x = (b2-b1)/(k1-k2);
            if ( (x>=x21) && (x<=x22) ) {
                if ( (x>=x11) && (x<=x12) ) {
                    console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                    return true;
                }
                if ( (x>=x12) && (x<=x11) ) {
                    console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                    return true;
                }
                
            }
            if ( (x>=x22) && (x<=x21) ) {
                if ( (x>=x11) && (x<=x12) ) {
                    console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                    return true;
                }
                if ( (x>=x12) && (x<=x11) ) {
                    console.log(Letters[i]+Letters[n]+' & '+Letters[j]+Letters[m]);
                    return true;
                }
            }
        }
    }
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
    const vertical = initialBaseSideOrient.classList.contains('vertical');
    const context = mainDraft.getContext('2d');
    context.lineJoin = 'round';
    let minX = MATRIX['A'].x;
    let minY = MATRIX['A'].y;
    let maxX = MATRIX['A'].x;
    let maxY = MATRIX['A'].y;
    for ( let pointKey in MATRIX ) {
        if ( pointKey == Letters[initialTopInput.value] ) break;
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

    for ( let i=0; i<initialTopInput.value; i++ ) {
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
    const startPoint = MATRIX[Letters[initialTopInput.value-1]];
    r = scale*startPoint.r;
    x = Math.round(r*Math.cos(startPoint.fi)) + shiftX;
    y = heightCanvas - shiftY - Math.round(r*Math.sin(startPoint.fi));
    context.moveTo(x, y);
    for ( let i=initialTopInput.value; i<length; i++ ) {
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
    if ( vertical ) dX *= -1;
    if ( direction == 'right' )
        point2 = MATRIX[Letters[length-1]];
    if ( direction == 'left' )
        point2 = MATRIX[Letters[length-3]];
    if ( direction == 'forward' )
        point2 = MATRIX[Letters[length-3]];
    if ( direction == 'reverse' )
        point2 = MATRIX[Letters[length-1]];
    for ( let i=0; i<initialTopInput.value-1; i++ ) {
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

    point1 = MATRIX[Letters[length-3]];
    point2;
    flag = true;
    dX = trougth*Math.SQRT1_2;
    dY = -trougth*Math.SQRT1_2;
    if ( vertical ) dY *= -1;
    if ( direction == 'right' )
        point2 = MATRIX[Letters[length-2]];
    if ( direction == 'left' ) {
        point2 = MATRIX[Letters[length-4]];
        flag = false;
    }
    if ( direction == 'forward' )
        point2 = MATRIX[Letters[length-2]];
    if ( direction == 'reverse' ) {
        flag = false;
        point2 = MATRIX[Letters[length-4]];
    }
    for ( let i=0; i<initialTopInput.value-1; i++ ) {
        const point3 = MATRIX[Letters[i]];
        const point4 = MATRIX[Letters[i+1]];
        const pointCross = crossPoint(
            {'x':point1.x+dX, 'y':point1.y+dY},
            {'x':point2.x+dX, 'y':point2.y+dY},
            point3,
            point4
        );
        if ( pointCross) {
            if ( segmentLineHasPoint(pointCross, point3, point4) ) {
                if ( flag ) {
                    flag = false;
                    continue;
                }
                let r = scale*point1.r;
                let x = Math.round(r*Math.cos(point1.fi)) + shiftX;
                let y = heightCanvas - shiftY - Math.round(r*Math.sin(point1.fi));
                context.moveTo(x, y);
                pointInter2.x = point1.x+dX;
                pointInter2.y = point1.y+dY;
                pointInter2.r = Math.sqrt((point1.x+dX)*(point1.x+dX) + (point1.y+dY)*(point1.y+dY));
                pointInter2.fi = calcFi((point1.x+dX), (point1.y+dY));
                r = scale*pointInter2.r;
                x = Math.round(r*Math.cos(pointInter2.fi)) + shiftX;
                y = heightCanvas - shiftY - Math.round(r*Math.sin(pointInter2.fi));
                context.lineTo(x, y);
                pointCross2.x = pointCross.x;
                pointCross2.y = pointCross.y;
                pointCross2.r = Math.sqrt(pointCross.x*pointCross.x + pointCross.y*pointCross.y);
                pointCross2.fi = calcFi(pointCross.x, pointCross.y);
                r = scale*pointCross2.r;
                x = Math.round(r*Math.cos(pointCross2.fi)) + shiftX;
                y = heightCanvas - shiftY - Math.round(r*Math.sin(pointCross2.fi));
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
    for ( let i=0; i<initialTopInput.value-1; i++ ) {
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
                point = pointCross2;
                if ( segmentLineHasPoint(point, point1, point2) )
                counterNum = 2;
            }
            if ( counterNum == 2 ) {
                secondCounter.push(Object.assign({}, pointCross2));
                secondCounter.push(Object.assign({}, pointInter2));
                secondCounter.push(Object.assign({}, MATRIX[Letters[length-3]]));
                secondCounter.push(Object.assign({}, MATRIX[Letters[length-2]]));
                firdCounter.push(Object.assign({}, pointInter2));
                firdCounter.push(Object.assign({}, pointCross2));
            }
            counterNum++;
        }
        if ( counterNum == 1 )
        firstCounter.push(Object.assign({}, MATRIX[Letters[i+1]]));
        if ( counterNum == 2 )
        secondCounter.push(Object.assign({}, MATRIX[Letters[i+1]]));
        if ( counterNum == 3 )
        firdCounter.push(Object.assign({}, MATRIX[Letters[i+1]]));
    }
    firdCounter.push(Object.assign({}, MATRIX[Letters[length-4]]));
    firdCounter.push(Object.assign({}, MATRIX[Letters[length-3]]));
}

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

// изменен тип настроек;
initialSettingsTypes.forEach(item => {
    item.addEventListener('click', (event) => {
        const clickClass = (event.target.classList.contains('base')) ? 'base' : 'extend';
        initialSettingsTypes.forEach(item => {
            if ( item.classList.contains(clickClass) )
            item.classList.add('active-settings-type');
            else
            item.classList.remove('active-settings-type');
        });
        if ( clickClass == 'base' ) {
            initialBodyBase.style.display = 'flex';
            initialBodyExtend.style.display = 'none';
        }
        else {
            initialBodyBase.style.display = 'none';
            initialBodyExtend.style.display = 'flex';
        }
    });
});

// запрет на ввод неверных данных в количества углов;
initialTopInput.addEventListener('keydown', (event) => {
    const key = event.key;
    if ( isNaN(key) && key != 'Backspace') event.preventDefault();
    else {
        initialBaseSideSelect.classList.add('first-side');
        baseSideLabel();
    }
});
initialTopInput.addEventListener('input', () => {
    let flag = false;
    for (let point in COORDS) {
        for (let prop in COORDS[point]) {
            if ( COORDS[point][prop] != 0 ) flag = true;
        }
    }
    if ( flag ) {
        if ( !confirm('Предыдущие данные будут утеряны.') ) {
            event.preventDefault();
            return;
        }
        COORDS = [];
    }
    if ( initialTopInput.value>26 ) initialTopInput.value = 26;
    initialBaseSideSelect.classList.add('first-side');
    initialRightAngle.textContent = Letters[initialTopInput.value-2];
    initialImpactContainer.textContent = '';
    for ( let i=0; i<initialTopInput.value; i++ ) {
        initialImpactContainer.innerHTML += `<a href="#initial" class="initial-impact__point btn">${Letters[i]}</a>`;
    }
    baseSideLabel();
});
initialTopInput.addEventListener('change', () => {
    if ( initialTopInput.value<4 ) initialTopInput.value = 4;
    initialBaseSideSelect.classList.add('first-side');
    initialRightAngle.textContent = Letters[initialTopInput.value-2];
    baseSideLabel();
});

// клик по вершинам, оказывающим влияние;
document.addEventListener('click', (event) => {
    if ( event.target.classList.contains('initial-impact__point') )
    event.target.classList.toggle('disable-btn');
});

//изменение левого угла;
initialLeftAngle.addEventListener('click', () => {
    let i = Letters.indexOf(initialLeftAngle.textContent) + 1;
    if ( i >= Letters.indexOf(initialRightAngle.textContent) ) i = 1;
    initialLeftAngle.textContent = Letters[i];
    baseSideLabel();
});

//изменение правого угла;
initialRightAngle.addEventListener('click', () => {
    let i = Letters.indexOf(initialRightAngle.textContent) - 1;
    if ( i <= Letters.indexOf(initialLeftAngle.textContent) ) i = initialTopInput.value -2;
    initialRightAngle.textContent = Letters[i];
    baseSideLabel();
});

// запрет на ввод неверных величин измерений;
indataRowValue.addEventListener('keydown', (event) => {
    const key = event.key;
    if ( isNaN(key) && key !='Backspace' && key != '.' ) {
        event.preventDefault();
        return;
    }
    if ( indataRowValue.value == '0' ) indataRowValue.value = '';
});

// запрет на ввод неверной глубины тумбы;
initialDepths.forEach(item => {
    item.addEventListener('keydown', (event) => {
        const key = event.key;
        if ( isNaN(key) && (key != 'backspace') ) event.preventDefault();
    });
});
initialDepths.forEach(item => {
    item.addEventListener('change', () => {
        if (item.value < 300) initialDepth.value = 300;
        if (item.value > 900) initialDepth.value = 900;
    });
});
initialDepths.forEach(item => {
    item.addEventListener('input', () => {
        if ( item.classList.contains('first') ) {
            firstDepth = item.value;
            initialDepths.forEach(elem => {
                elem.value = firstDepth;
            });
        }
        if ( item.classList.contains('second') ) {
            secondDepth = item.value;
            initialDepths.forEach(elem => {
                if ( !elem.classList.contains('first') )
                elem.value = secondDepth;
            });
        }
        if ( item.classList.contains('fird') )
        firdDepth = item.value;
    });
});

// запрет на ввод неверного нависания;
initialOverhangs.forEach(item => {
    item.addEventListener('keydown', (event) => {
        const key = event.key;
        if ( isNaN(key) && (key != 'backspace') ) event.preventDefault();
    });
});
initialOverhangs.forEach(item => {
    item.addEventListener('change', () => {
        if (item.value < 0) initialOverhang.value = 0;
        if (item.value > 150) initialOverhang.value = 150;
    });
});
initialOverhangs.forEach(item => {
    item.addEventListener('input', () => {
        if ( item.classList.contains('first') ) {
            firstOverhang = item.value;
            initialOverhangs.forEach(elem => {
                elem.value = val;
            });
        }
        if ( item.classList.contains('second') ) {
            secondOverhang = item.value;
            initialOverhangs.forEach(elem => {
                if ( !elem.classList.contains('first') )
                elem.value = val;
            });
        }
        if ( item.classList.contains('fird') )
        firdOverhang = item.value;
    });
});

document.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', (event) => {
        event.preventDefault();
        const href = event.target.getAttribute('href');
        location.hash = href;
    });
});

window.addEventListener('hashchange', () => {
    let displayClass = '';
    const href = location.hash;
    for (let i=1; i<href.length; i++) displayClass += href[i];
    document.querySelectorAll('section').forEach(item => {
        let displayProp = 'none';
        if ( item.classList.contains(displayClass) ) displayProp = 'flex';
        item.style.display = displayProp;
    });
});

// изменен тип ввода в настройках;
initialType.addEventListener('click', () => {
    initialType.classList.toggle('modul-before');
    let text = 'Переменный ввод';
    if (initialType.classList.contains('modul-before')) text = 'Сначала модули';
    initialType.textContent = text;
    indataRowNext.classList.add('modul-input');
});

// надпись на кнопке базовая сторона;
const baseSideLabel = () => {
    if ( initialBaseSideSelect.classList.contains('first-side') )
    initialBaseSideSelect.textContent = 'A' + initialLeftAngle.textContent;
    else
    initialBaseSideSelect.textContent = initialRightAngle.textContent + Letters[initialTopInput.value-1];
}

// изменена базовая сторона;
initialBaseSideSelect.addEventListener('click', () => {
    initialBaseSideSelect.classList.toggle('first-side');
    baseSideLabel();
});

// изменена ориентация базовой стороны в настрйоках;
initialBaseSideOrient.addEventListener('click', () => {
    initialBaseSideOrient.classList.toggle('vertical');
    if ( initialBaseSideOrient.classList.contains('vertical') )
    initialBaseSideOrient.textContent = 'Вертикально';
    else
    initialBaseSideOrient.textContent = 'Горизонтально';
});

initialBaseCounter.addEventListener('click', () => {
    let direction = initialBaseCounter.getAttribute('data-direction');
    const Keys = Array.from(Object.keys(Directions));
    let i = Keys.indexOf(direction) + 1;
    if ( i >= Keys.length ) i = 0;
    initialBaseCounter.setAttribute('data-direction', Keys[i]);
    initialBaseCounter.textContent = Directions[Keys[i]];
});

// применить настройки;
initialNext.addEventListener('click', () => {
    nonImpactPoints = [];
    initialImpactPoints = document.querySelectorAll('.initial-impact__point');
    initialImpactPoints.forEach(item => {
        if ( item.classList.contains('disable-btn') )
        nonImpactPoints.push(item.textContent);
    });
    const leftAngleNum = Letters.indexOf(initialLeftAngle.textContent);
    const rightAngleNum = Letters.indexOf(initialRightAngle.textContent);
    flag = true;
    for ( let i=leftAngleNum; i<=rightAngleNum; i++ ) {
        if ( !nonImpactPoints.includes(Letters[i]) ) {
            flag = false;
            break;
        }
    }
    if ( flag ) {
        alert('Нет точек для определения второй столешницы.');
        const event = new Event('hashchange');
        location.hash = '#initial';
        window.dispatchEvent(event);
    }
    let length = 0;
    for ( let keys in COORDS ) length++;
    if ( length != 0 ) return;
    for (let i=0; i<+initialTopInput.value+4; i++) {
        COORDS[Letters[i]] = {'modul':0, 'move':0, 'angle':0};
    }
});

// переход к следующему измерению;
indataRowNext.addEventListener('click', () => {
    const point = indataRowNext.getAttribute('data-point');
    let type = 'move';
    if ( indataRowNext.classList.contains('modul-input') ) type = 'modul';
    const value = indataRowValue.value;
    if ( saveInputData(point, type, value) ) {
        if ( testInputData() ) {
            location.hash = '#draft';
            baseToDecart();
            changeDatumPoint(MATRIX['A'].x, MATRIX['A'].y, MATRIX);
            const basePointOne = initialBaseSideSelect.textContent[0];
            const basePointTwo = initialBaseSideSelect.textContent[1];
            const dX = MATRIX[basePointTwo].x - MATRIX[basePointOne].x;
            const dY = MATRIX[basePointTwo].y - MATRIX[basePointOne].y;
            let angle = Math.atan2(dY, dX);
            if ( initialBaseSideOrient.classList.contains('vertical') )
            angle -= Math.PI/2;
            rotate(MATRIX, angle);

            if ( initialBaseSideSelect.classList.contains('first-side') ) {
                if (initialBaseSideOrient.classList.contains('vertical')) {
                    if ( Math.round(MATRIX['A'].y-MATRIX['B'].y)>0 )
                    rotate(MATRIX, Math.PI);
                }
                else {
                    if ( Math.round(MATRIX['A'].x-MATRIX['B'].x)>0 )
                    rotate(MATRIX, Math.PI);
                }
            }
            else {
                if (initialBaseSideOrient.classList.contains('vertical')) {
                    if ( Math.round(MATRIX[basePointTwo].y-MATRIX[basePointOne].y)>0 )
                    rotate(MATRIX, Math.PI);
                }
                else {
                    if ( Math.round(MATRIX[basePointTwo].x-MATRIX[basePointOne].x)>0 )
                    rotate(MATRIX, Math.PI);
                }
            }

            addInternalPoints();
            let newBaseX = MATRIX['A'].x;
            let newBaseY = MATRIX['A'].y;
            for (let pointKey in MATRIX) {
                if ( MATRIX[pointKey].x < newBaseX ) newBaseX = MATRIX[pointKey].x;
                if ( MATRIX[pointKey].y < newBaseY ) newBaseY = MATRIX[pointKey].y;
            }
            changeDatumPoint(newBaseX, newBaseY, MATRIX);
            if ( checkCross() ) {
                alert('Ошибка построения эскиза. Грани пересекаются.');
                const event = new Event('hashchange');
                location.hash = '#indata';
                window.dispatchEvent(event);
                return;
            }
            const direction = initialBaseCounter.getAttribute('data-direction');
            displayFromMatrix(70, 70, direction);
            displaySize();
            
            if ( initialBaseSideOrient.classList.contains('vertical') )
            rotate(firstCounter, Math.PI/2);
            newBaseX = firstCounter[0].x;
            newBaseY = firstCounter[0].y;
            for ( let i in firstCounter ) {
                if ( firstCounter[i].x<newBaseX ) newBaseX = firstCounter[i].x;
                if ( firstCounter[i].y<newBaseY ) newBaseY = firstCounter[i].y;
            }
            changeDatumPoint(newBaseX, newBaseY, firstCounter);
            displayFrom(firstCounter, firstDraft, finalTablesFirstBody);

            if ( !initialBaseSideOrient.classList.contains('vertical') ) 
            rotate(secondCounter, -Math.PI/2);
            newBaseX = secondCounter[0].x;
            newBaseY = secondCounter[0].y;
            for ( let i in secondCounter ) {
                if ( secondCounter[i].x<newBaseX ) newBaseX = secondCounter[i].x;
                if ( secondCounter[i].y<newBaseY ) newBaseY = secondCounter[i].y;
            }
            changeDatumPoint(newBaseX, newBaseY, secondCounter);
            displayFrom(secondCounter, secondDraft, finalTablesSecondBody);

            if ( initialBaseSideOrient.classList.contains('vertical') ) 
            rotate(firdCounter, -Math.PI/2);
            else rotate(firdCounter, Math.PI);
            newBaseX = firdCounter[0].x;
            newBaseY = firdCounter[0].y;
            for ( let i in firdCounter ) {
                if ( firdCounter[i].x<newBaseX ) newBaseX = firdCounter[i].x;
                if ( firdCounter[i].y<newBaseY ) newBaseY = firdCounter[i].y;
            }
            changeDatumPoint(newBaseX, newBaseY, firdCounter);
            displayFrom(firdCounter, firdDraft, finalTablesFirdBody);
        }
    }
});

// к предыдущему измерению;
indataRowPrev.addEventListener('click', () => {
    const point = indataRowNext.getAttribute('data-point');
    const modulInput = indataRowNext.classList.contains('modul-input');
    let i = 0;
    for (i=0; i<Letters.length; i++) {
        if ( Letters[i] == point ) break;
    }
    const prevPoint = Letters[i-1];
    if ( initialType.classList.contains('modul-before') ) {
        if ( point == 'A' ) return;
        if ( point == 'B' ) {
            if ( modulInput )
            createIndataRowLabel('A', 'modul');
            else
            createIndataRowLabel(Letters[initialTopInput.value-1], 'modul');
        }
        else {
            if ( modulInput )
            createIndataRowLabel(prevPoint, 'modul');
            else
            createIndataRowLabel(prevPoint, 'move');
        }
    }
    else {
        if ( modulInput ) {
            if ( point != 'A' ) {
                if ( point == 'B' ) {
                    createIndataRowLabel(prevPoint, 'modul');
                    return;
                }
                createIndataRowLabel(prevPoint, 'move');
            }
        }
        else
        createIndataRowLabel(point, 'modul');
    } 
});