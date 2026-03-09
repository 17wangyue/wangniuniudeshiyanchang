// 获取DOM元素
const input = document.getElementById('input');
const error = document.getElementById('error');
const historyList = document.getElementById('history-list');
const buttons = document.querySelectorAll('button');
const settingsButton = document.querySelector('.settings-button');
const settingsDropdown = document.querySelector('.settings-dropdown');
const themeColorSelect = document.getElementById('theme-color');
const buttonSizeSelect = document.getElementById('button-size');

// 初始化主题颜色
let currentThemeColor = localStorage.getItem('calculatorThemeColor') || '#4a6fa5';
updateThemeColor(currentThemeColor);

// 初始化按钮大小
let currentButtonSize = localStorage.getItem('calculatorButtonSize') || 'medium';
updateButtonSize(currentButtonSize);

// 设置主题颜色
function updateThemeColor(color) {
    document.documentElement.style.setProperty('--theme-color', color);
    document.querySelector('h1').style.color = color;
    localStorage.setItem('calculatorThemeColor', color);
}

// 设置按钮大小
function updateButtonSize(size) {
    let padding, fontSize;
    switch(size) {
        case 'small':
            padding = '10px';
            fontSize = '14px';
            break;
        case 'large':
            padding = '20px';
            fontSize = '20px';
            break;
        default:
            padding = '15px';
            fontSize = '18px';
    }
    buttons.forEach(button => {
        button.style.padding = padding;
        button.style.fontSize = fontSize;
    });
    localStorage.setItem('calculatorButtonSize', size);
}

// 切换设置下拉框
settingsButton.addEventListener('click', () => {
    settingsDropdown.classList.toggle('show');
});

// 点击其他地方关闭下拉框
window.addEventListener('click', (e) => {
    if (!settingsButton.contains(e.target) && !settingsDropdown.contains(e.target)) {
        settingsDropdown.classList.remove('show');
    }
});

// 主题颜色变化
themeColorSelect.addEventListener('change', (e) => {
    updateThemeColor(e.target.value);
});

// 按钮大小变化
buttonSizeSelect.addEventListener('change', (e) => {
    updateButtonSize(e.target.value);
});

// 初始化历史记录
let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];

// 显示历史记录
function renderHistory() {
    historyList.innerHTML = '';
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-row">
                <span class="history-content">${item.expression} = ${item.result}</span>
                <span class="history-time">${item.time}</span>
            </div>
        `;
        historyList.appendChild(historyItem);
    });
}

// 保存历史记录
function saveHistory(expression, result) {
    const now = new Date();
    const time = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const historyItem = {
        expression,
        result,
        time
    };
    
    history.unshift(historyItem);
    // 只保留最近10条记录
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    renderHistory();
}

// 显示错误信息
function showError(message) {
    error.textContent = message;
    setTimeout(() => {
        error.textContent = '';
    }, 3000);
}

// 清除错误信息
function clearError() {
    error.textContent = '';
}

// 计算逻辑
function calculate(expression) {
    try {
        // 安全计算，使用Function构造函数
        const result = new Function('return ' + expression)();
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('计算结果无效');
        }
        return result.toString();
    } catch (e) {
        showError('计算错误: ' + e.message);
        return null;
    }
}

// 按钮点击事件处理
buttons.forEach(button => {
    // 排除设置按钮
    if (button.classList.contains('settings-button')) {
        return;
    }
    
    button.addEventListener('click', () => {
        const value = button.textContent;
        
        if (value === 'del') {
            // 清除输入
            input.value = '';
            clearError();
        } else if (value === '=') {
            // 计算结果
            const expression = input.value;
            if (!expression) {
                showError('请输入计算表达式');
                return;
            }
            
            const result = calculate(expression);
            if (result) {
                input.value = result;
                saveHistory(expression, result);
            }
        } else if (value === 'sin') {
            // 正弦函数
            input.value += 'Math.sin(';
            clearError();
        } else if (value === 'cos') {
            // 余弦函数
            input.value += 'Math.cos(';
            clearError();
        } else if (value === 'tan') {
            // 正切函数
            input.value += 'Math.tan(';
            clearError();
        } else if (value === '√') {
            // 平方根
            input.value += 'Math.sqrt(';
            clearError();
        } else if (value === '^2') {
            // 平方
            input.value += '**2';
            clearError();
        } else if (value === 'π') {
            // 圆周率
            input.value += 'Math.PI';
            clearError();
        } else if (value === 'e') {
            // 自然常数
            input.value += 'Math.E';
            clearError();
        } else if (value === 'C') {
            // 删除键
            input.value = input.value.slice(0, -1);
            clearError();
        } else {
            // 添加数字或运算符
            input.value += value;
            clearError();
        }
    });
});

// 键盘输入支持
window.addEventListener('keydown', (e) => {
    const key = e.key;
    
    // 数字和运算符
    if (/[0-9+\-*/.]/.test(key)) {
        input.value += key;
        clearError();
    } else if (key === 'Enter') {
        // 计算结果
        const expression = input.value;
        if (!expression) {
            showError('请输入计算表达式');
            return;
        }
        
        const result = calculate(expression);
        if (result) {
            input.value = result;
            saveHistory(expression, result);
        }
    } else if (key === 'Escape') {
        // 清除输入
        input.value = '';
        clearError();
    } else if (key === 'Backspace') {
        // 删除最后一个字符
        input.value = input.value.slice(0, -1);
        clearError();
    }
});

// 初始渲染历史记录
renderHistory();