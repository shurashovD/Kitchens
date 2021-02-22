const firstPedestalDepth = document.querySelector('input[name="first-pedestal-depth"]');
const firstFrontOverhang = document.querySelector('input[name="first-front-overhang"]');
const secondPedestalDepth = document.querySelector('input[name="second-pedestal-depth"]');
const secondFrontOverhang = document.querySelector('input[name="second-front-overhang"]');
const firdPedestalDepth = document.querySelector('input[name="fird-pedestal-depth"]');
const firdFrontOverhang = document.querySelector('input[name="fird-front-overhang"]');
const firstSecondTrougth = document.querySelector('input[name="first-second-trougth"]');
const firstDieX = document.querySelector('input[name="first-diex"]');
const form = document.querySelector('form');

firstPedestalDepth.addEventListener('input', (event) => {
    const input = event.target;
    if ( isNaN(event.data) && (event.data != '.') ) {
        const str = input.value;
        input.value = '';
        for ( let i=0; i < (str.length-1); i++ )
        input.value += str[i];
    }
});

firstFrontOverhang.addEventListener('input', (event) => {
    const input = event.target;
    if ( isNaN(event.data) && (event.data != '.') ) {
        const str = input.value;
        input.value = '';
        for ( let i=0; i < (str.length-1); i++ )
        input.value += str[i];
    }
});

secondPedestalDepth.addEventListener('input', (event) => {
    const input = event.target;
    if ( isNaN(event.data) && (event.data != '.') ) {
        const str = input.value;
        input.value = '';
        for ( let i=0; i < (str.length-1); i++ )
        input.value += str[i];
    }
});

secondFrontOverhang.addEventListener('input', (event) => {
    const input = event.target;
    if ( isNaN(event.data) && (event.data != '.') ) {
        const str = input.value;
        input.value = '';
        for ( let i=0; i < (str.length-1); i++ )
        input.value += str[i];
    }
});

firdPedestalDepth.addEventListener('input', (event) => {
    const input = event.target;
    if ( isNaN(event.data) && (event.data != '.') ) {
        const str = input.value;
        input.value = '';
        for ( let i=0; i < (str.length-1); i++ )
        input.value += str[i];
    }
});

firdFrontOverhang.addEventListener('input', (event) => {
    const input = event.target;
    if ( isNaN(event.data) && (event.data != '.') ) {
        const str = input.value;
        input.value = '';
        for ( let i=0; i < (str.length-1); i++ )
        input.value += str[i];
    }
});

firstSecondTrougth.addEventListener('input', (event) => {
    const input = event.target;
    if ( isNaN(event.data) && (event.data != '.') ) {
        const str = input.value;
        input.value = '';
        for ( let i=0; i < (str.length-1); i++ )
        input.value += str[i];
    }
});

form.addEventListener('submit', (event) => {
    const required = (input) => {
        input.style.backgroundColor = '#ffaaaa';
        setTimeout(() => {
            input.style.backgroundColor = '#ffffff';
        }, 2000);
    }
    if ( firstPedestalDepth.value.length == 0 ) {
        event.preventDefault();
        required(firstPedestalDepth);
        return;
    }
    if ( firstFrontOverhang.value.length == 0 ) {
        event.preventDefault();
        required(firstFrontOverhang);
        return;
    }
    if ( firstDieX.value.length == 0 ) {
        event.preventDefault();
        required(firstDieX);
        return;
    }
    if ( secondPedestalDepth.value.length == 0 ) {
        event.preventDefault();
        required(secondPedestalDepth);
        return;
    }
    if ( secondFrontOverhang.value.length == 0 ) {
        event.preventDefault();
        required(secondFrontOverhang);
        return;
    }
    if ( firstSecondTrougth.value.length == 0 ) {
        event.preventDefault();
        required(firstSecondTrougth);
        return;
    }
    if ( (firstPedestalDepth.value > 1200) || (firstPedestalDepth.value < 300) ) {
        event.preventDefault();
        required(firstPedestalDepth);
        return
    }
    if ( firstFrontOverhang.value > 200 ) {
        event.preventDefault();
        required(firstFrontOverhang);
        return
    }
    if ( (secondPedestalDepth.value > 1200) || (secondPedestalDepth.value < 300) ) {
        event.preventDefault();
        required(secondPedestalDepth);
        return
    }
    if ( secondFrontOverhang.value > 200 ) {
        event.preventDefault();
        required(secondFrontOverhang);
        return
    }
    if ( (firdPedestalDepth.value > 1200) || (firdPedestalDepth.value < 300) ) {
        event.preventDefault();
        required(firdPedestalDepth);
        return
    }
    if ( firdFrontOverhang.value > 200 ) {
        event.preventDefault();
        required(firdFrontOverhang);
        return
    }
    if ( (firstDieX.value > 6000) || (firstDieX.value < 300) ) {
        event.preventDefault();
        required(firstdieX);
        return
    }
    if ( (firstSecondTrougth.value > 100) || (firstSecondTrougth.value < 10) ) {
        event.preventDefault();
        required(firstSecondTrougth);
        return
    }
});