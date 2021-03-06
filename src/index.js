// В первую очередь обрабатывается range для тултипа
const rangeInput = document.querySelector('.ac-range__input');
const rangeTooltip = document.querySelector('.ac-range__tooltip');

// В событии изменяется значение тултипа и его положение
rangeInput.addEventListener('input', (event) => {
  const { value, min, max } = event.target;
  const percentOffset = (value - min) / (max - min) * 100;
  rangeTooltip.innerHTML = getNumberWithSpace(value);
  rangeTooltip.style.left = `${percentOffset}%`;
});


// Коэффициенты для расчета накоплений
const DEPOSITCOEF = 1.0698; // под 6,98% годовых
const INVESTCOEF = 1.7121; // 71,21%
const TERM = 36; // 3 года = 36 месяцев

// Создаем массив для хранения значений поступивших значений
const data = [];

// Для расчета всех данных
const dataStorage = {
  average: data, // для записи всех данных от пользователей
  counter: 0, // считаем количество пользователей которые расчитали сумму
  min: 0, // процент всех пользователей откладывающих больше 1 000
  max: 0, // процент всех пользователей откладывающих больше 10 000
}


// Событие для инпута
rangeInput.addEventListener('change', (event) => {
  const value = Number(event.target.value);

  // Все поля для подстановки значений
  const result = {
    title: document.querySelector('.ac_answer__result-title'),
    mattress: document.getElementById('mattress'),
    deposit: document.getElementById('deposit'),
    invest: document.getElementById('invest'),
  }
  
  // Подставляем расчитанные значения в контейнеры
  result.title.innerHTML = `Вы откладываете ${getNumberWithSpace(value)} в месяц.<br>За три года вы бы заработали:`;
  result.mattress.textContent = getSum(value, TERM);
  result.deposit.textContent = getSum(value, TERM, DEPOSITCOEF);
  result.invest.textContent = getSum(value, TERM, INVESTCOEF);


  // Раскрывающийся контейнер изначально display: none
  const answerContainer = document.querySelector('.ac_answer');
  answerContainer.classList.add('show-container');
  // TODO: требуется полифил для сафари
  answerContainer.scrollIntoView({ behavior: 'smooth' });

  // Присваиваем иконки в зависимости от максимума
  const mattressCoin = document.getElementById('ac-coin-mattress');
  const depositCoin = document.getElementById('ac-coin-deposit');
  const investCoin = document.getElementById('ac-coin-invest');
  mattressCoin.src = `images/${getCoinStepImage(+getSumWithoutFormat(value, TERM), 3081780)}`;
  depositCoin.src = `images/${getCoinStepImage(+getSumWithoutFormat(value, TERM, DEPOSITCOEF), 3081780)}`;
  investCoin.src = `images/${getCoinStepImage(+getSumWithoutFormat(value, TERM, INVESTCOEF), 3081780)}`;



  // Пушим значение инпута от пользователя
  // Заполняем объект с данными
  data.push(value);
  dataStorage.counter = data.length;
  dataStorage.min = data.filter(item => item > 1000 && item < 10000).length;
  dataStorage.max = data.filter(item => item > 10000).length;

  // Расчитываем среднюю сумму и подставляем в контейнер
  const avarageAmount = document.getElementById('avarage-amount');
  const mean = data.reduce((sum, item) => (sum + item), 0) / data.length;
  avarageAmount.textContent = `~${getNumberWithSpace(mean)}`;

  // Подставляем нужную картинку в зависимости от средней суммы
  const getImage = getImageMoney(mean);
  const imageItem = document.querySelector('.ac-average__image');
  imageItem.src = `images/${getImage}`;

  console.log(dataStorage);

  // Контейнеры для подстановки значений [в среднем откладывают читатели]
  const minPercent = document.getElementById('min-percent');
  const maxPercent = document.getElementById('max-percent');
  // Контейнеры для диаграмы в зависимости от количества процентов
  const diagramMin = document.getElementById('min-diagram');
  const diagramMax = document.getElementById('max-diagram');

  // Расчитываем среднее по пользователям в процентах
  const minPercentValue = dataStorage.min * 100 / dataStorage.counter;
  minPercent.textContent = `${Math.round(minPercentValue)}%`;
  diagramMin.style = `stroke-dasharray: ${getPercentDiagram(minPercentValue)}px 408px;`;

  const maxPercentValue = dataStorage.max * 100 / dataStorage.counter;
  maxPercent.textContent = `${Math.round(maxPercentValue)}%`;
  diagramMax.style = `stroke-dasharray: ${getPercentDiagram(maxPercentValue)}px 408px;`;
});


// Show container on click
const showBtn = document.querySelector('.alfa-promo__middle');
const showContainer = document.querySelector('.ac_answer__avarage-child');
const showSpan = document.querySelector('.alfa-promo__middle-span');

showBtn.addEventListener('click', () => {
  showContainer.classList.toggle('show-container');

  // TODO: требуется полифил для сафари
  setTimeout(() => showContainer.scrollIntoView({ behavior: 'smooth' }), 300);

  if (showContainer.classList.contains('show-container')) {
    showSpan.textContent = "Свернуть";
  } else {
    showSpan.textContent = "А как в среднем у читателей vc.ru?";
  }
});


// Расчитывает сумму за 3 года
// Если не указан коэфициент - отдаем сумму * 36 месяцев
// Иначе возвращаем сумму за 36 месяцев + проценты
// TODO: расчет под 6.9% годовых должен расчитываться как то по другому
// https://money.inguru.ru/vklady/stat_kak_rasschitat_procenty_po_vkladu
function getSum(value, term, factor = 1){
  return getNumberWithSpace(value * term * factor);
}
// Без форматирования
function getSumWithoutFormat(value, term, factor = 1){
  return value * term * factor;
}

// Принимает сумму, возвращает название картинки соответствующей сумме
const imageList = [
  "ac-money-0.svg", 
  "ac-money-1.svg", 
  "ac-money-2.svg", 
  "ac-money-3.svg", 
  "ac-money-4.svg"
]

function getImageMoney(number){
  const imageId = Math.floor(number / 10000);
  return `ac-money-${imageId}.svg`;
}

// Принимает сумму, возвращает название картинки соответствующей сумме
const imageCoinList = [
  "ac-coin-0.svg",
  "ac-coin-1.svg",
  "ac-coin-2.svg",
  "ac-coin-3.svg",
  "ac-coin-4.svg",
  "ac-coin-5.svg",
  "ac-coin-6.svg",
  "ac-coin-7.svg",
  "ac-coin-8.svg",
  "ac-coin-9.svg",
]

// Расчитываем шаг для добавления монеток
// Каждому результату при определенной стратегии соответствует свое количество монеток. 
// Логика такая: 1) нужно вычислить максимально возможные значения этих трёх категорий 
// 2) разделить максимальные значения на 10, чтобы вычислить шаги, с которыми добавляются монетки. 
// Например, если максимально возможное значение в категории — 1000, то при значении 286 будут показываться три монетки
function getCoinStepImage(sum, max){
  const step = max / 9;
  return `ac-coin-${Math.floor(sum / step)}.svg`;
}


// Расставляет пробелы в числах
const currencyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,      
});

function getNumberWithSpace(number){
  return currencyFormatter.format(number);
}

// Принимает процент, возвращает стили для СВГ диаграммы
// Избавится от магического числа
function getPercentDiagram(value){
  return value * 408 / 100;
}


// Управление подсказками
// TODO: заменить события на click
let tooltipElem;

document.onmouseover = function(event) {
  const target = event.target;

  let tooltipHtml = target.dataset.tooltip;
  if (!tooltipHtml) {
    return;
  };

  tooltipElem = document.createElement('div');
  tooltipElem.className = 'abbr__tooltip';
  tooltipElem.innerHTML = tooltipHtml;
  document.body.append(tooltipElem);

  // top-center position
  const coords = target.getBoundingClientRect();

  let left = coords.left + (target.offsetWidth - tooltipElem.offsetWidth) / 2;
  if (left < 0) {
    left = 0;
  };

  let top = coords.top - tooltipElem.offsetHeight - 5;
  if (top < 0) {
    top = coords.top + target.offsetHeight + 5;
  }

  tooltipElem.style.left = `${left}px`;
  tooltipElem.style.top = `${top}px`;
};


document.onmouseout = function(e) {
  if (tooltipElem) {
    tooltipElem.remove();
    tooltipElem = null;
  }
};



// Генератор свг монеток
// Не круто и грязно
// const svgContainer = document.querySelector('.ac-coin-svg');
// svgContainer.innerHTML = svgCoinGenerator(3);

// function svgCoinGenerator(quantity){
//   let stepSize = 0;

//   if (quantity === 1) {
//     stepSize = 0;
//   } else {
//     stepSize = (quantity - 1) * 18;
//   }

//   if (quantity >= 9) {
//     stepSize = 8 * 18;
//     quantity = 9;
//   }

//   const svgStart = `<svg width="${55 + stepSize}px" height="56px" viewBox="0 0 ${55 + stepSize} 56" style="margin: auto;display:block;"><g id="ac-coins">`;

//   let coinPath = ``;
//   for (let i = 0; i < quantity; i++) {
//     coinPath += `<g class="ac-coin" transform="translate(${i * 16}.000000, 0.000000)"><path d="M30.5,56 C17,56 6,43.5 6,28 C6,12.5 17,0 30.5,0 C44,0 55,12.5 55,28 C55,43.5 44,56 30.5,56 Z" id="Path" fill="#FEEBEF"></path><path d="M6,28 C6,13.7 15.4,1.9 27.5,0.2 C26.5,0.1 25.5,0 24.5,0 C11,0 0,12.5 0,28 C0,43.5 11,56 24.5,56 C25.5,56 26.5,55.9 27.5,55.8 C15.4,54.1 6,42.3 6,28 Z" id="Path" fill="#FFBFCD"></path><path d="M30.6,50.5 C29.8,50.5 29.1,50.5 28.4,50.4 C27.9,50.3 27.5,49.8 27.5,49.3 C27.6,48.8 28.1,48.4 28.6,48.4 C29.2,48.5 29.7999,48.5 30.5,48.5 C31.1,48.5 31.5,48.9 31.5,49.5 C31.5,50.1 31.1,50.5 30.6,50.5 Z M36.4,49.4 C36,49.4 35.6,49.2 35.5,48.8 C35.2999,48.3 35.5999,47.7 36.0999,47.5 C36.6999,47.3 37.2999,47 37.7999,46.7 C38.2999,46.4 38.8999,46.6 39.0999,47.1 C39.3999,47.6 39.2,48.2 38.7,48.4 C38.1,48.7 37.4,49 36.7999,49.2 C36.5999,49.4 36.5,49.4 36.4,49.4 Z M22.9,48.7 C22.7,48.7 22.6,48.7 22.4,48.6 C21.8,48.3 21.2,47.9 20.6,47.6 C20.1,47.3 20,46.7 20.3,46.2 C20.6,45.7 21.2,45.6 21.7,45.9 C22.2,46.2 22.8,46.6 23.3,46.8 C23.8,47.1 24,47.7 23.7,48.1 C23.6,48.5 23.2,48.7 22.9,48.7 Z M43,45.1 C42.7,45.1 42.5,45 42.2999,44.8 C41.9,44.4 41.9,43.8 42.2999,43.4 C42.6999,43 43.1999,42.5 43.5999,42 C43.8999,41.6 44.5999,41.5 45,41.9 C45.4,42.3 45.5,42.9 45.0999,43.3 C44.6999,43.8 44.2,44.4 43.7,44.8 C43.5,45 43.2,45.1 43,45.1 Z M16.8,43.7 C16.5,43.7 16.2,43.6 16,43.3 C15.6,42.8 15.1,42.2 14.8,41.6 C14.5,41.1 14.6,40.5 15.1,40.2 C15.6,39.9 16.2,40 16.5,40.5 C16.9,41 17.2,41.5 17.6,42 C18,42.4 17.9,43.1 17.5,43.4 C17.2,43.6 17,43.7 16.8,43.7 Z M47.4,38.6 C47.3,38.6 47.0999,38.6 47,38.5 C46.5,38.3 46.2999,37.7 46.5,37.2 C46.7999,36.6 47,36 47.2,35.4 C47.4,34.9 47.9,34.6 48.5,34.8 C49,35 49.2999,35.5 49.0999,36.1 C48.8999,36.8 48.6,37.4 48.4,38 C48.1,38.4 47.8,38.6 47.4,38.6 Z M12.9,36.8 C12.5,36.8 12.1,36.5 12,36.1 C11.8,35.5 11.6,34.8 11.4,34.1 C11.3,33.6 11.6,33 12.1,32.9 C12.6,32.8 13.2,33.1 13.3,33.6 C13.5,34.2 13.6,34.8 13.8,35.4 C14,35.9 13.7,36.5 13.2,36.7 C13.2,36.8 13.1,36.8 12.9,36.8 Z M49.2999,30.9 C49.2,30.9 49.2,30.9 49.2999,30.9 C48.7,30.9 48.2999,30.4 48.2999,29.8 C48.2999,29.2 48.4,28.6 48.4,28 C48.4,27.4 48.8,27 49.4,27 C50,27 50.4,27.4 50.4,28 C50.4,28.7 50.3999,29.3 50.2999,30 C50.2,30.5 49.7999,30.9 49.2999,30.9 Z M11.7,29 C11.1,29 10.7,28.6 10.7,28 C10.7,27.3 10.7,26.6 10.8,26 C10.8,25.5 11.3,25 11.9,25.1 C12.5,25.1 12.9,25.6 12.8,26.2 C12.8,26.8 12.7,27.5 12.7,28.1 C12.7,28.6 12.2,29 11.7,29 Z M48.5999,23 C48.1999,23 47.6999,22.7 47.5999,22.2 C47.3999,21.6 47.2999,21 47.0999,20.4 C46.8999,19.9 47.2,19.3 47.7,19.1 C48.2,18.9 48.7999,19.2 49,19.7 C49.2,20.3 49.3999,21 49.5999,21.7 C49.6999,22.2 49.4,22.8 48.9,22.9 C48.8,23 48.6999,23 48.5999,23 Z M12.9,21.2 C12.8,21.2 12.7,21.2 12.6,21.1 C12.1,20.9 11.8,20.4 12,19.8 C12.2,19.2 12.5,18.5 12.7,17.9 C12.9,17.4 13.5,17.2 14,17.4 C14.5,17.6 14.7,18.2 14.5,18.7 C14.2,19.3 14,19.9 13.8,20.5 C13.7,21 13.3,21.2 12.9,21.2 Z M45.4,15.8 C45.1,15.8 44.7999,15.6 44.5999,15.4 C44.1999,14.9 43.9,14.4 43.5,13.9 C43.0999,13.5 43.1999,12.8 43.5999,12.5 C44,12.1 44.7,12.2 45,12.6 C45.4,13.1 45.9,13.7 46.2,14.3 C46.5,14.8 46.4,15.4 45.9,15.7 C45.8,15.8 45.6,15.8 45.4,15.8 Z M16.7,14.3 C16.5,14.3 16.3,14.2 16.1,14.1 C15.7,13.8 15.6,13.1 16,12.7 C16.4,12.2 16.9,11.6 17.4,11.2 C17.8,10.8 18.4,10.8 18.8,11.2 C19.2,11.6 19.2,12.2 18.8,12.6 C18.4,13 17.9,13.5 17.5,14 C17.3,14.2 17,14.3 16.7,14.3 Z M39.7999,10.3 C39.5999,10.3 39.4,10.2 39.2999,10.1 C38.7999,9.8 38.2,9.4 37.7,9.2 C37.2,9 37,8.3 37.2999,7.9 C37.5,7.4 38.0999,7.2 38.5999,7.5 C39.1999,7.8 39.8,8.2 40.4,8.5 C40.9,8.8 41,9.4 40.7,9.9 C40.5,10.1 40.0999,10.3 39.7999,10.3 Z M22.8,9.3 C22.4,9.3 22.1,9.1 21.9,8.8 C21.6,8.3 21.8,7.7 22.3,7.5 C22.9,7.2 23.6,6.9 24.2,6.7 C24.7,6.5 25.3,6.8 25.5,7.3 C25.7,7.8 25.4,8.4 24.9,8.6 C24.3,8.8 23.7,9.1 23.2,9.4 C23.1,9.3 23,9.3 22.8,9.3 Z M32.4,7.6 L32.2999,7.6 C31.6999,7.5 31.1,7.5 30.5,7.5 C29.9,7.5 29.5,7.1 29.5,6.5 C29.5,5.9 29.9,5.5 30.5,5.5 C31.2,5.5 31.9,5.5 32.5,5.6 C33,5.7 33.4,6.2 33.4,6.7 C33.4,7.2 32.9,7.6 32.4,7.6 Z" id="Shape" fill="#FFBFCD"></path><path d="M6,29 L0,29 C0,29.7 0.1,30.3 0.1,31 L6.1,31 C6.1,30.3 6,29.7 6,29 Z" id="Path" fill="#F48BA2"></path><path d="M6.2,24 L0.2,24 C0.1,24.7 0.1,25.3 0,26 L6,26 C6.1,25.3 6.1,24.7 6.2,24 Z" id="Path" fill="#F48BA2"></path><path d="M6.5,34 L0.5,34 C0.6,34.7 0.8,35.3 1,36 L7,36 C6.8,35.3 6.7,34.7 6.5,34 Z" id="Path" fill="#F48BA2"></path><path d="M7.8999,39 L1.8999,39 C2.1999,39.7 2.3999,40.3 2.6999,41 L8.6999,41 C8.4999,40.3 8.1999,39.7 7.8999,39 Z" id="Path" fill="#F48BA2"></path><path d="M7.300049,19 L1.300049,19 C1.10005,19.7 0.900049,20.3 0.800049,21 L6.800049,21 C6.90005,20.3 7.10005,19.7 7.300049,19 Z" id="Path" fill="#F48BA2"></path><path d="M9.2999,14 L3.2999,14 C2.9999,14.7 2.6999,15.3 2.3999,16 L8.3999,16 C8.5999,15.3 8.8999,14.7 9.2999,14 Z" id="Path" fill="#F48BA2"></path><path d="M13.3,8 L7.29995,8 C6.69995,8.6 6.19995,9.3 5.69995,10 L11.7,10 C12.2,9.3 12.8,8.6 13.3,8 Z" id="Path" fill="#F48BA2"></path><path d="M19.5001,3 L13.5001,3 C12.5001,3.6 11.5001,4.3 10.6001,5 L16.6001,5 C17.5001,4.3 18.4001,3.6 19.5001,3 Z" id="Path" fill="#F48BA2"></path><path d="M11,45 L5,45 C5.5,45.7 6,46.4 6.5,47 L12.5,47 C12,46.4 11.5,45.7 11,45 Z" id="Path" fill="#F48BA2"></path><path d="M9.30005,50 C10.1,50.7 10.9,51.4 11.8,52 L17.8,52 C16.9,51.4 16.1,50.7 15.3,50 L9.30005,50 Z" id="Path" fill="#F48BA2"></path><path d="M31.9976,33.1802 L28.0669,33.1802 L28.0669,36 L24.9907,36 L24.9907,33.1802 L22.4883,33.1802 L22.4883,30.7021 L24.9907,30.7021 L24.9907,29.396 L22.4883,29.396 L22.4883,26.918 L24.9907,26.918 L24.9907,18.2266 L31.79,18.2266 C33.7513,18.2266 35.3179,18.7393 36.4897,19.7646 C37.6616,20.7819 38.2476,22.1369 38.2476,23.8296 C38.2476,25.5549 37.6901,26.9098 36.5752,27.8945 C35.4603,28.8711 33.91,29.3716 31.9243,29.396 L28.0669,29.396 L28.0669,30.7021 L31.9976,30.7021 L31.9976,33.1802 Z M28.0669,26.918 L31.7412,26.918 C32.848,26.918 33.6943,26.6616 34.2803,26.1489 C34.8662,25.6362 35.1592,24.8713 35.1592,23.854 C35.1592,22.9425 34.8703,22.1979 34.2925,21.6201 C33.7228,21.0423 32.9334,20.7412 31.9243,20.7168 L28.0669,20.7168 L28.0669,26.918 Z" id="Shape" fill="#F48BA2"></path></g>`;
//   }

//   const svgEnd = `</g></svg>`;

//   return svgStart + coinPath + svgEnd;
// }