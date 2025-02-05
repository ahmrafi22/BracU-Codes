//Quotes
const quotes = [
    "'Life is what happens to you while you're busy making other plans' - John Lennon.",
    "'In the middle of every difficulty lies opportunity' - Albert Einstein.",
    "'Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment' - Buddha.",
    "'Life is really simple, but we insist on making it complicated' - Confucius.",
    "'The purpose of our lives is to be happy' - Dalai Lama.",
    "'Life is 10% what happens to us and 90% how we react to it' - Charles R. Swindoll.",
    "'Good friends, good books, and a sleepy conscience: this is the ideal life' - Mark Twain.",
    "'Life is either a daring adventure or nothing at all' - Helen Keller.",
    "'The unexamined life is not worth living' - Socrates.",
    "'To live is the rarest thing in the world. Most people exist, that is all' - Oscar Wilde.",
    "'Life isn't about finding yourself. Life is about creating yourself' - George Bernard Shaw.",
    "'In three words I can sum up everything I've learned about life: it goes on' - Robert Frost.",
    "'The biggest adventure you can ever take is to live the life of your dreams' - Oprah Winfrey.",
    "'Success is not final, failure is not fatal: it is the courage to continue that counts' - Winston Churchill.",
    "'Life is a succession of lessons which must be lived to be understood' - Ralph Waldo Emerson.",
    "'Not how long, but how well you have lived is the main thing' - Seneca.",
    "'The meaning of life is to find your gift. The purpose of life is to give it away' - Pablo Picasso.",
    "'Life shrinks or expands in proportion to one's courage' - Anaïs Nin.",
    "'Your time is limited, don't waste it living someone else's life' - Steve Jobs.",
    "'Life is about making an impact, not making an income' - Kevin Kruse."
  ];


const quoteBox = document.getElementById('quote-box');

function setTheme(textColor, borderColor, bgColor, fontFamily, fontSize) {
    quoteBox.style.color = textColor;
    quoteBox.style.borderColor = borderColor;
    quoteBox.style.backgroundColor = bgColor;
    quoteBox.style.fontFamily = fontFamily;
    quoteBox.style.fontSize = fontSize;
    quoteBox.style.border = `2px solid ${borderColor}`;
}

window.addEventListener('load', () => {
    quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    
    setTheme('#1e40af', '#3b82f6', '#dbeafe', 'Georgia', '1.7rem');

});


//Weight converter 
function convert() {
    const weight = parseFloat(document.getElementById('weightInput').value);
    const conversionType = document.getElementById('conversionType').value;
    const resultSpan = document.getElementById('result');

    if (isNaN(weight)) {
        resultSpan.textContent = "Please enter a valid number";
        alert("Please enter a valid number");
        return;
    }


    let result;
    if (conversionType === 'kgToLbs') {
        result = weight * 2.2046;
        resultSpan.textContent = `${weight} kilograms = ${result.toFixed(2)} Pounds`;
    } else {
        result = weight * 0.4536;
        resultSpan.textContent = `${weight} Pounds = ${result.toFixed(2)} kilograms`;
    }
}


// min max avg
const numberInput = document.getElementById('numberInput');
        const maxElement = document.getElementById('max');
        const minElement = document.getElementById('min');
        const sumElement = document.getElementById('sum');
        const averageElement = document.getElementById('average');
        const reverseElement = document.getElementById('reverse');

        function calculateStats() {
            const numbers = numberInput.value
                .split(',')
                .map(num => parseFloat(num.trim()))
                .filter(num => !isNaN(num));

            if (numbers.length === 0) {
                [maxElement, minElement, sumElement, averageElement, reverseElement].forEach(el => el.textContent = '-');
                console.log("There is No numbers")
                return;
            }

            maxElement.textContent = Math.max(...numbers);
            minElement.textContent = Math.min(...numbers);
            
            const sum = numbers.reduce((a, b) => a + b, 0);
            sumElement.textContent = sum;
            averageElement.textContent = (sum / numbers.length).toFixed(2);
            reverseElement.textContent = [...numbers].reverse().join(', ');
        }

numberInput.addEventListener('input', calculateStats);


//text manipulation
let capitalizeToggle = false;

function toggleManipulation(action) {
    const textArea = document.getElementById('text');
    let lines = textArea.value.split('\n');

    switch(action) {
        case 'clear':
            lines = [];
            break;
        
        case 'capitalize':
            lines = lines.map(line => {
                if (!capitalizeToggle) {
                    return line.toUpperCase();
                } else {
                    return line.toLowerCase();
                }
            });
            capitalizeToggle = !capitalizeToggle;
            break;
        
        case 'sort':
            lines = lines.sort();
            break;
        
        case 'reverse':
            lines = lines.map(line => line.split('').reverse().join(''));
            break;
        
        case 'stripBlank':
            lines = lines
                .filter(line => line.trim() !== '')  
                .map(line => line.trim()); 
            break;
        
        case 'addNumbers':
            lines = lines.map((line, index) => `${index + 1}. ${line.replace(/^\d+\.\s*/, '')}`);
            break;
        
        case 'shuffle':
            for (let i = lines.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [lines[i], lines[j]] = [lines[j], lines[i]];
            }
            break;
    }


    textArea.value = lines.join('\n');
}