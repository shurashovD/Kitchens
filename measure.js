const canvasConteiner = document.querySelector('.canvas-conteiner');
const measuringCanvas = document.querySelector('#measuring-canvas');
const measuringCanvasCtx = measuringCanvas.getContext('2d');
const measuringDialog = document.querySelector('.measuring-dialog');
const inputMeasure = document.querySelector('.input-measure');
const inputMeasureBtn = document.querySelector('.input-measure-btn');
const devicePanel = document.querySelector('.device-panel');
const display = document.querySelector('.display');
const verificRow = document.querySelector('.verific-row');
const verific = document.querySelector('.verific');
const verificValue = document.querySelector('.verific__value');
const verificAction = document.querySelector('.verific__action');
const errorMsg = document.querySelector('.verific__error');
const outTableBody = document.querySelector('.out-table-body');

const Letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const lettersMap = new Map();
Letters.forEach((e, i) => lettersMap.set(i, e));

let MeasPoints = new Map();
let Step = 0;
let COORDS = [];
let MATRIX = [];

let currentLetterIndex = 0;

let scale = 1;

let displayCoords = [];
let dieCoordsX = [];
let dieCoordsY = [];


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
            return;
        }
        baseToDecart();
        changeDatumPoint(MATRIX['A'].x, MATRIX['A'].y);
        transform();
        let minX = MATRIX['A'].x;
        for (let pointKey in MATRIX) {
            if ( MATRIX[pointKey].x < minX ) minX = MATRIX[pointKey].x;
        }
        changeDatumPoint(minX, MATRIX['A'].y);
        shiftForX = 20 + Object.keys(MATRIX).length * 25;
        displayFromMatrix(shiftForX, 400);
        displayDie('i', shiftForX, 400);
        arrangementSize(shiftForX, 400);
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
        canvasConteiner.childNodes.forEach(node => {
            if ( 'style' in node )
            node.style.display = 'none'; 
        });
        display.style.display = 'flex';
    }
    if ( Step == 5 ) {
        for (let pointKey in MATRIX) {
            const x = MATRIX[pointKey].x;
            const y = MATRIX[pointKey].y;
            const content = `
                <tr class="out-table-body-tr">
                    <td class="out-table-body__point">${pointKey}</td>
                    <td class="out-table-body__x">${x}</td>
                    <td class="out-table-body__y">${y}</td>
                </tr>
            `;
            outTableBody.insertAdjacentHTML('beforeend', content);
        }
        document.querySelector('.measuring-panel').style.display = 'none';
        document.querySelector('.out').style.display = 'flex';
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

// сохранение замера в массиве COORDS;
const structData = () => {
    COORDS = [];
    MeasPoints.forEach((item, key) => {
        COORDS[key] = { modul: item.modul, move: item.move, angle: item.angle };
    });
    for (let key in COORDS) {
        if ( key == 'A' ) {
            if ( COORDS[key].modul == 0 ) return false;
            continue;
        }
        for ( let prop in COORDS[key] ) {
            if ( COORDS[key][prop] == 0 ) return false;
            if ( COORDS[key][prop] == 'undefined' ) return false;
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
        const x = (-1)*r * Math.cos(Fi);
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

// вращение объекта по последней стороне;
const transform = () => {
    let Fi;
    for ( let pointKey in MATRIX ) { Fi = MATRIX[pointKey].fi; }
    for ( let pointKey in MATRIX ) {
        MATRIX[pointKey].fi -= Fi;
        const r = MATRIX[pointKey].r;
        MATRIX[pointKey].x = r*Math.cos(MATRIX[pointKey].fi);
        MATRIX[pointKey].y = r*Math.sin(MATRIX[pointKey].fi);
    }
}

// сменить точку отсчета;
const changeDatumPoint = (dX, dY) => {
    for ( let pointKey in MATRIX ) {
        const x = MATRIX[pointKey].x - dX;
        const y = MATRIX[pointKey].y - dY;
        const r = Math.sqrt(x*x + y*y);
        let fi = 0;
        
        if ( y > 0 ) {
            if ( x == 0 ) {
                // y вверх;
                fi = Math.PI/2;
            }
            if ( x > 0 ) {
                // первый квадрант;
                fi = Math.atan2(y, x);
            }
            if ( x < 0 ) {
                // второй квадрант;
                fi = Math.PI - Math.atan2(y, Math.abs(x));
            }
        }
        if ( y == 0 ) {
            if ( x < 0 ) {
                // x влево;
                fi = Math.PI;
            }
            if ( x > 0 ) {
                // x вправо;
                fi = 0;
            }
            if ( x == 0 ) {
                fi = 0;
            }
        }
        if ( y < 0 ) {
            if ( x < 0 ) {
                // третий квадрант;
                fi = Math.PI + Math.atan2(Math.abs(y), Math.abs(x));
                //console.log('третий квадрант ' + pointKey);
            }
            if ( x == 0 ) {
                // y вниз;
                fi = 1.5*Math.PI;
                //console.log('у вниз ' + pointKey);
            }
            if ( x > 0 ) {
                // четвертый квадрант;
                fi = 2*Math.PI - Math.atan2(Math.abs(y), x);
                //console.log('четвертый квадрант ' + pointKey);
            }
        }

        MATRIX[pointKey].x = x;
        MATRIX[pointKey].y = y;
        MATRIX[pointKey].r = r;
        MATRIX[pointKey].fi = fi;
    }
    return true;
}

// вывести изображение объекта из Matrix;
const displayFromMatrix = (shiftX, fullShiftY) => {
    let context = display.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 1200, 900);
    context.fill();
    context.beginPath();
    context.strokeStyle = '#f60018';
    context.lineWidth = '3';
    context.moveTo(Math.round(MATRIX['A'].x) + shiftX, Math.round(MATRIX['A'].y) + fullShiftY);

    let minX = MATRIX['A'].x;
    let minY = MATRIX['A'].y;
    let maxX = MATRIX['A'].x;
    let maxY = MATRIX['A'].y;
    for ( let pointKey in MATRIX ) {
        if ( MATRIX[pointKey].x < minX ) minX = MATRIX[pointKey].x;
        if ( MATRIX[pointKey].y < minY ) minY = MATRIX[pointKey].y;
        if ( MATRIX[pointKey].x > maxX ) maxX = MATRIX[pointKey].x;
        if ( MATRIX[pointKey].y > maxY ) maxY = MATRIX[pointKey].y;
    }
    const difX = Math.abs(maxX-minX);
    const difY = Math.abs(maxY-minY);
    const scaleX = ( difX < dieX ) ? (1200 - 20 - shiftX)/dieX : (1200 - 20 - shiftX)/difX;
    const scaleY = ( difY < dieY ) ? 350/dieY : 350/difY;
    if ( difY > dieY ) alert('Размер ' + dieY + 'mm превышен по Y');
    if ( difX > dieX ) alert('Размер ' + dieX + 'mm превышен по X');
    scale = (scaleX < scaleY) ? scaleX : scaleY;
    let minScaleX = 32000;
    let minScaleY = 32000;
    let maxScaleX = -32000;
    let maxScaleY = -32000;
    for ( let pointKey in MATRIX ) {
        const r = scale*MATRIX[pointKey].r;
        x = Math.round(r*Math.cos(MATRIX[pointKey].fi)) + shiftX;
        y = fullShiftY - Math.round(r*Math.sin(MATRIX[pointKey].fi));
        if ( x < minScaleX ) minScaleX = x;
        if ( y < minScaleY ) minScaleY = y;
        if ( x > maxScaleX ) maxScaleX = x;
        if ( y > maxScaleY ) maxScaleY = y;
        context.lineTo(x, y);
        context.fillStyle = '#000000';
        context.fillText(pointKey, x + 15, y - 7);
        const displayPoint = {"x": x, "y": y};
        displayCoords[pointKey] = displayPoint;
    }
    context.closePath();
    context.stroke();
}

// отрисовать плашку;
const displayDie = (type, shiftX, shiftY) => {
    if ( type == 'i' ) {
        let context = display.getContext('2d');
        context.beginPath();
        context.strokeStyle = '#000000';
        context.lineWidth = '3';
        const width = scale * dieX + shiftX;
        const height = shiftY - scale * dieY;
        context.moveTo(shiftX, shiftY);
        context.lineTo(shiftX, height);
        context.lineTo(width, height);
        context.lineTo(width, shiftY);
        context.closePath();
        context.stroke();
    }
}

// показать размеры;
const arrangementSize = (shiftX, shiftY) => {
    let countPoint = 0;
    let fullShiftY = shiftY + 25*(Object.keys(MATRIX).length-2);
    const trait = 2;
    const indent = 25;
    const smallIndent = 20;
    const shelf = 50;
    let context = display.getContext('2d');
    context.strokeStyle = '#086ca2';
    context.lineWidth = '1';
    let sortCoordsByX = [];
    for (let key in displayCoords) sortCoordsByX.push(key);
    sortCoordsByX = sortCoordsByX.sort((a, b) => {
        return displayCoords[a].x - displayCoords[b].x;
    });
    sortCoordsByX.forEach(pointKey => {
        if ( Math.abs(MATRIX[pointKey].x) != 0 ) {
            x = displayCoords[pointKey].x;
            y = displayCoords[pointKey].y;
            context.beginPath();
            // вертикальная размерная линия;
            context.moveTo(x, y);
            context.lineTo(x, fullShiftY + indent*(countPoint + 1));
            //  горизонтальная размерная линия;
            context.moveTo(x, fullShiftY + smallIndent + indent*countPoint);
            context.lineTo(shiftX, fullShiftY + smallIndent + indent*countPoint);
            // правый штрих;
            context.moveTo(x + trait, fullShiftY + smallIndent - trait + indent*countPoint);
            context.lineTo(x - trait, fullShiftY +smallIndent + trait + indent*countPoint);
            // левый штрих;
            context.moveTo(shiftX + trait, fullShiftY + smallIndent - trait + indent*countPoint);
            context.lineTo(shiftX - trait, fullShiftY + smallIndent + trait + indent*countPoint);
            // размерная надпись;
            context.textAlign = 'right';
            context.fillText(pointKey + ': ' + Math.abs(MATRIX[pointKey].x).toFixed(), shiftX - 10, fullShiftY + indent + indent*countPoint);

            context.closePath();
            context.stroke();
            context.fill();
            countPoint++;
        }
    });
    // вертикальная размерная линия через точку А;
    context.beginPath();
    context.moveTo(shiftX, shiftY);
    context.lineTo(shiftX, fullShiftY + indent*countPoint);
    context.closePath();
    context.stroke();
    
    let sortCoordsByY = [];
    for (let key in displayCoords) sortCoordsByY.push(key);
    sortCoordsByY = sortCoordsByY.sort((a, b) => {
        return displayCoords[b].y - displayCoords[a].y;
    });
    countPoint = 0;
    sortCoordsByY.forEach(pointKey => {
        if ( Math.abs(MATRIX[pointKey].y) != 0 ) {
            x = displayCoords[pointKey].x;
            y = displayCoords[pointKey].y;
            context.beginPath();
            // горизонтальная линия от точки;
            context.moveTo(x, y);
            context.lineTo(shiftX - indent*(countPoint+1), y);
            // вертикальная размерная линия;
            context.moveTo(shiftX - smallIndent - indent*countPoint, y);
            context.lineTo(shiftX - smallIndent - indent*countPoint, shiftY + indent*(sortCoordsByY.length-countPoint-2));
            // полка для размерной линии;
            context.lineTo(shiftX - smallIndent - indent*countPoint - shelf, shiftY + indent*(sortCoordsByY.length-countPoint-2));
            // размерная надпись;
            context.textAlign = 'right';
            const text = pointKey + ': ' + Math.abs(MATRIX[pointKey].y).toFixed();
            context.fillText(text, shiftX - smallIndent - indent*countPoint - 5, shiftY + indent*(sortCoordsByY.length-countPoint-2) - 5);
            //  верхняя засечка;
            context.moveTo(shiftX - smallIndent + trait - indent*countPoint, y - trait);
            context.lineTo(shiftX - smallIndent - trait -indent*countPoint, y + trait);
            // нижняя засечка;
            context.moveTo(shiftX - smallIndent + trait - indent*countPoint, shiftY - trait);
            context.lineTo(shiftX - smallIndent - trait - indent*countPoint, shiftY + trait);

            context.closePath();
            context.stroke();
            ++countPoint;
        }
    });
    // горизонтальная линия от точки А;
    context.beginPath();
    context.moveTo(shiftX, shiftY);
    context.lineTo(shiftX - indent*countPoint, shiftY);
    context.closePath();
    context.stroke();
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

measuringCanvas.addEventListener('mousedown', (mousedown) => {
    const clientRect = measuringCanvas.getBoundingClientRect();
    const clickX = parseInt(mousedown.clientX - clientRect.left);
    const clickY = parseInt(mousedown.clientY - clientRect.top);
    if (Step == 0) {
        if ( (Math.abs(clickX - 40) < 10)&&(Math.abs(clickY - 40) < 10) ) {
            pointByCoords(40, 40, '#ff0000');
            MeasPoints.set(
                lettersMap.get(MeasPoints.size), {modul: 0, move: 0, angle: 0, x: 40, y: 40}
            );
            return;
        }
        if ( (Math.abs(clickX - 940) < 10)&&(Math.abs(clickY - 40) < 10) ) {
            pointByCoords(940, 40, '#ff0000');
            MeasPoints.set(
                lettersMap.get(MeasPoints.size), {modul: 0, move: 0, angle: 0, x: 940, y: 40}
            );
            return;
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

