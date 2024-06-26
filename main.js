Array.prototype.shuffle = function() {
    for (var i = this.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = this[i];
        this[i] = this[j];
        this[j] = tmp;
    }
    return this;
};

document.addEventListener('DOMContentLoaded', function() {
    var BINGO = 'HOUSE';
    var NUM_SPAN = 15;
    var MAX_NUM = 75;

    function NumberManager() {
        var numArr = [];
        var totalNumArr = [];

        initialize();

        return {
            initialize: initialize,
            getNext: getNext,
            getHead: getHead,
            reset: reset
        };

        function initialize() {
            for (var i = 0; i < 75; i++) {
                totalNumArr.push(i + 1);
            }
            totalNumArr.shuffle();
        }

        function getNext() {
            var num = totalNumArr.pop();
            numArr.push(num);
            return num;
        }

        function getHead(num) {
            var index = Math.floor((num - 1) / NUM_SPAN);
            return BINGO.charAt(index);
        }

        function reset() {
            numArr = [];
            totalNumArr = [];
            initialize();
        }
    }

    function Roulette() {
        var container = document.querySelector('.roulette');
        var slots = document.querySelectorAll('.roulette > .slot');
        var slotArr = [];
        var stoppedNum = 0;

        initialize();

        return {
            initialize: initialize,
            start: start,
            reset: reset
        };

        function initialize() {
            var arr = [];
            for (var i = 0; i < BINGO.length; i++) {
                arr.push(BINGO.charAt(i));
            }
            slotArr.push(Slot(arr, slots[0]));

            arr = [];
            for (var i = 0; i < 10; i++) {
                arr.push(i);
            }

            slotArr.push(Slot(arr, slots[1]));
            slotArr.push(Slot(arr, slots[2]));
        }

        function start(text) {
            stoppedNum = 0;
            for (var i = 0; i < slotArr.length; i++) {
                var slot = slotArr[i];
                slot.moveTo(text.charAt(i));
            }
        }

        function reset() {
            // Reset logic here if needed
        }
    }

    function Slot(arr, elem) {
        var slotArr = [];
        var slotElemArr = [];
        var container;
        var height;
        var currentIndex = 0;
        var targetCurrentIndex;
        var intervalId;

        var v0 = 50;
        var duration = 3000;
        var revol = 20;
        var movedPos = 0;

        initialize(arr, elem);

        return {
            initialize: initialize,
            moveTo: moveTo
        };

        function initialize(arr, elem) {
            container = elem.querySelector('.wrapper');
            height = elem.clientHeight;
            for (var i = 0; i < arr.length; i++) {
                slotArr.push(arr[i]);
            }

            for (i = 0; i < 3; i++) {
                var slotElem = document.createElement('div');
                slotElem.innerHTML = slotArr[i];
                slotElemArr.push(slotElem);
                container.appendChild(slotElem);
                slotElem.style.top = -i * height + 'px';
            }
        }

        function getIndex(text) {
            for (var i = 0; i < slotArr.length; i++) {
                if (slotArr[i] == text) {
                    return i;
                }
            }
            return -1;
        }

        function moveTo(text) {
            var targetIndex = getIndex(text);
            targetCurrentIndex = targetIndex - (currentIndex % slotArr.length) + revol + currentIndex;
            intervalId = setInterval(moving, 30);
        }

        function resetPosition() {
            for (var i = 0; i < slotElemArr.length; i++) {
                var elem = slotElemArr[i];
                elem.style.top = -i * height + 'px';
            }
        }

        function moving() {
            var nextTop = parseInt(container.style.top || '0') + v0;

            if (nextTop > height) {
                var num = Math.floor(nextTop / height);

                for (var i = 0; i < num; i++) {
                    var first = slotElemArr.shift();
                    var nextIndex = (currentIndex + 3) % slotArr.length;
                    currentIndex++;
                    first.innerHTML = slotArr[nextIndex];
                    slotElemArr.push(first);
                }

                nextTop = nextTop % height;
                resetPosition();
            }

            if (currentIndex >= targetCurrentIndex) {
                var num = currentIndex - targetCurrentIndex;
                for (var i = 0; i < num; i++) {
                    var last = slotElemArr.pop();
                    var nextIndex = (currentIndex - 3 + slotArr.length) % slotArr.length;
                    currentIndex--;
                    last.innerHTML = slotArr[nextIndex];
                    slotElemArr.unshift(last);
                }

                clearInterval(intervalId);
                nextTop = -num * height;
                resetPosition();
            }

            container.style.top = nextTop + 'px';
        }
    }

    function Board() {
        var container = document.querySelector('.board_area ul');
        var numElemArr = [];

        initialize();

        return {
            initialize: initialize,
            reset: reset,
            select: select
        };

        function initialize() {
            var currentRow = null;
            var fragment = document.createDocumentFragment();

            for (var i = 0; i < MAX_NUM; i++) {
                if (i % NUM_SPAN === 0) {
                    var index = Math.floor(i / NUM_SPAN);
                    currentRow = document.createElement('li');
                    fragment.appendChild(currentRow);

                    var headStr = BINGO.charAt(index);
                    var headElem = document.createElement('p');
                    headElem.innerHTML = headStr;
                    headElem.className = 'head';
                    currentRow.appendChild(headElem);
                }

                var p = document.createElement('p');
                p.innerHTML = Number(i + 1);
                currentRow.appendChild(p);
                numElemArr.push(p);
            }

            container.appendChild(fragment);
        }

        function select(num) {
            numElemArr[num - 1].classList.add('selected');
        }

        function reset() {
            numElemArr.forEach(function(p) {
                p.classList.remove('selected');
            });
        }
    }

    function initialize() {
        var numberManager = NumberManager();
        var roulette = Roulette();
        var board = Board();
        var isMoving = false;

        var startBtn = document.querySelector('.btn_start');
        var resetBtn = document.querySelector('.btn_reset');

        function start() {
            if (isMoving) return;

            isMoving = true;
            var nextNumber = numberManager.getNext();

            roulette.start(numberManager.getHead(nextNumber) + ("00" + nextNumber).slice(-2));

            setTimeout(function() {
                board.select(nextNumber);
                setTimeout(function() {
                    isMoving = false;
                }, 1000);
            }, 3000);
        }

        function reset() {
            roulette.reset();
            board.reset();
            numberManager.reset();
        }

        startBtn.addEventListener('click', start);
        resetBtn.addEventListener('click', reset);
    }

    initialize();
});
