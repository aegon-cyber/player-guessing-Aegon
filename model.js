
// ... existing code ...
// 获取球员数据
let players = [];
let playerNames = [];
let selectedIndex = -1;
let filteredPlayers = [];
let answerPlayer;
let guessCount = 0;  // 添加猜测次数计数器
const MAX_GUESSES = 20;  // 设置最大猜测次数
let timeLeft = 120;  // 添加计时器变量
let timerInterval;  // 计时器间隔
let gameStarted = false;  // 游戏是否已开始
let currentMode = 'noob';  // 默认为noob模式

// 加载数据库并设置随机答案
async function loadPlayers() {
    try {
        // 根据当前模式选择数据库
        const dbFile = currentMode === 'noob' ? './noob.json' : './db.json';
        
        // 恢复与数据库的连接
        console.log(`正在从${currentMode}模式数据库加载球员数据...`);
        const response = await fetch(dbFile + '?v=' + new Date().getTime());
        if (!response.ok) {
            throw new Error('网络响应不正常，状态码: ' + response.status);
        }
        
        const data = await response.json();
        players = data.players;
        
        // 清空之前可能存在的数据
        playerNames = [];
        playerNames = players.map(player => player.name);
        
        console.log('从数据库加载了 ' + players.length + ' 名球员');
        
        // 随机选择一名球员作为答案
        const randomIndex = Math.floor(Math.random() * players.length);
        answerPlayer = players[randomIndex];
        console.log('游戏已准备就绪！目标球员已设置');
    } catch (error) {
        console.error('加载球员数据时出错:', error);
        alert('加载球员数据失败，请刷新页面重试');
    }
}

// 切换游戏模式
function switchMode(mode) {
    // 如果游戏已经开始，不允许切换模式
    if (gameStarted) {
        showError('游戏已开始，无法切换模式');
        return;
    }
    
    currentMode = mode;
    
    // 更新按钮状态
    document.getElementById('noobModeBtn').classList.toggle('active', mode === 'noob');
    document.getElementById('proModeBtn').classList.toggle('active', mode === 'pro');
    
    // 重新加载球员数据
    loadPlayers();
    
    // 更新提示文本
    const subtitle = document.querySelector('.subtitle');
    subtitle.textContent = mode === 'noob' ? 'Guess the mystery player (Easy Mode)' : 'Guess the mystery player (Pro Mode)';
}

// 页面加载时获取数据和初始化
window.addEventListener('DOMContentLoaded', async () => {
    await loadPlayers();
    updateGuessCounter();
    document.getElementById('timeLeft').textContent = timeLeft;
    
    // 添加模式切换按钮的事件监听
    document.getElementById('noobModeBtn').addEventListener('click', () => switchMode('noob'));
    document.getElementById('proModeBtn').addEventListener('click', () => switchMode('pro'));
    
    // 添加重新开始按钮的事件监听
    document.getElementById('startAgainBtn').addEventListener('click', function() {
        location.reload(); // 刷新页面重新开始
    });
});

// 其余JavaScript代码保持不变

// 更新剩余次数显示
function updateGuessCounter() {
    document.getElementById('guessCounter').textContent = MAX_GUESSES - guessCount;
}

// 启动计时器
function startTimer() {
    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('timeLeft').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showError(`时间到！正确答案是 ${answerPlayer.name}`);
                showBingo(answerPlayer, false); // 确保传入false参数显示YOU LOSE
                document.getElementById('playerInput').disabled = true; // 禁用输入框
            }
        }, 1000);
    }
}

// 页面加载时获取数据和初始化
window.addEventListener('DOMContentLoaded', async () => {
    await loadPlayers();
    updateGuessCounter();
    document.getElementById('timeLeft').textContent = timeLeft;
});

// 处理输入
function handleInput(event) {
    const input = event.target.value.toLowerCase();
    const autocompleteList = document.getElementById('autocompleteList');

    // 如果是方向键，处理选择逻辑
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        handleArrowKeys(event.key === 'ArrowDown' ? 1 : -1);
        return;
    }

    // 改进的球员匹配逻辑
    filteredPlayers = playerNames.filter(name => 
        name.toLowerCase().includes(input)
    ).slice(0, 5);

    // 显示建议列表
    if (input && filteredPlayers.length > 0) {
        selectedIndex = -1;
        autocompleteList.innerHTML = filteredPlayers
            .map((player, index) => `
                <div class="autocomplete-item" 
                     onclick="selectPlayer('${player}')"
                     data-index="${index}">
                    ${player}
                </div>
            `).join('');
        autocompleteList.style.display = 'block';
    } else {
        autocompleteList.style.display = 'none';
    }
}

// 处理键盘按下事件
function handleKeyDown(event) {
    const autocompleteList = document.getElementById('autocompleteList');
    
    if (event.key === 'Enter') {
        event.preventDefault();
        if (autocompleteList.style.display === 'block' && selectedIndex >= 0) {
            selectPlayer(filteredPlayers[selectedIndex]);
        } else {
            checkPlayer();
        }
    } else if (event.key === 'Escape') {
        autocompleteList.style.display = 'none';
    }
}

// 选择球员
function selectPlayer(name) {
    document.getElementById('playerInput').value = name;
    document.getElementById('autocompleteList').style.display = 'none';
    checkPlayer(); // 自动提交选择的球员
}

// 处理方向键
function handleArrowKeys(direction) {
    const items = document.querySelectorAll('.autocomplete-item');
    items[selectedIndex]?.classList.remove('selected');

    selectedIndex = (selectedIndex + direction + filteredPlayers.length) % filteredPlayers.length;
    items[selectedIndex]?.classList.add('selected');

    // 更新输入框的值
    document.getElementById('playerInput').value = filteredPlayers[selectedIndex];
}

const teamRegionMap = {
 'Manchester City': 'Premier League',
 'Manchester United': 'Premier League',
 'Liverpool FC': 'Premier League',
 'Chelsea': 'Premier League',
 'Tottenham Hotspur': 'Premier League',
 'Arsenal': 'Premier League',
 'Real Madrid': 'La Liga',
 'FC Barcelona': 'La Liga',
 "Atlético de Madrid": 'La Liga',
 'Bayern Munich': 'Bundesliga',
 'Paris Saint-Germain': 'Ligue 1',
 'Borussia Dortmund': 'Bundesliga',
 'Inter Milan': 'Ligue 1',
 'AC Milan': 'Ligue 1'
};
};
// 添加位置和惯用脚的映射关系
const positionMap = {
    'Goalkeeper': 'Goalkeeper',
    'Centre-Back': 'Defender', 'Left-Back': 'Defender', 'Right-Back': 'Defender',
    'Defensive Midfield': 'Midfield', 'Central Midfield': 'Midfield', 'Attacking Midfield': 'Midfield',
    'Left Winger': 'Winger', 'Right Winger': 'Winger',
    'Centre-Forward': 'Winger'
};
// 添加洲际映射关系
const continentMap = {
            // 欧洲国家
            'England': 'Europe', 'France': 'Europe', 'Spain': 'Europe', 'Germany': 'Europe',
            'Italy': 'Europe', 'Portugal': 'Europe', 'Netherlands': 'Europe', 'Belgium': 'Europe',
            'Denmark': 'Europe', 'Sweden': 'Europe', 'Norway': 'Europe', 'Switzerland': 'Europe',
            'Austria': 'Europe', 'Poland': 'Europe', 'Croatia': 'Europe', 'Serbia': 'Europe',
            'Ukraine': 'Europe', 'Russia': 'Europe', 'Scotland': 'Europe', 'Wales': 'Europe',
            'Ireland': 'Europe', 'Northern Ireland': 'Europe', 'Czech Republic': 'Europe',
            'Slovakia': 'Europe', 'Hungary': 'Europe', 'Romania': 'Europe', 'Bulgaria': 'Europe',
            'Greece': 'Europe', 'Turkey': 'Europe', 'Finland': 'Europe', 'Iceland': 'Europe',
            
            // 南美洲国家
            'Brazil': 'South America', 'Argentina': 'South America', 'Uruguay': 'South America',
            'Colombia': 'South America', 'Chile': 'South America', 'Peru': 'South America',
            'Ecuador': 'South America', 'Venezuela': 'South America', 'Paraguay': 'South America',
            'Bolivia': 'South America',
            
            // 北美洲国家
            'United States': 'North America', 'Mexico': 'North America', 'Canada': 'North America',
            'Costa Rica': 'North America', 'Jamaica': 'North America', 'Honduras': 'North America',
            'Panama': 'North America',
            
            // 非洲国家
            'Senegal': 'Africa', 'Nigeria': 'Africa', 'Egypt': 'Africa', 'Morocco': 'Africa',
            'Algeria': 'Africa', 'Tunisia': 'Africa', 'Ivory Coast': 'Africa', 'Ghana': 'Africa',
            'Cameroon': 'Africa', 'South Africa': 'Africa', 'Mali': 'Africa', 'Guinea': 'Africa',
            
            // 亚洲国家
            'Japan': 'Asia', 'South Korea': 'Asia', 'China': 'Asia', 'Iran': 'Asia',
            'Saudi Arabia': 'Asia', 'Qatar': 'Asia', 'United Arab Emirates': 'Asia',
            'Australia': 'Asia', 'Iraq': 'Asia', 'Uzbekistan': 'Asia',
            
            // 大洋洲
            'New Zealand': 'Oceania', 'Fiji': 'Oceania'
        };
        

// 修改checkPlayer函数中的比较逻辑
async function checkPlayer() {
    const playerName = document.getElementById('playerInput').value;
    if (!playerName) return;

    // 第一次输入时启动计时器
    if (!gameStarted) {
        startTimer();
    }

    try {
        // 检查时间
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showError(`时间到！正确答案是 ${answerPlayer.name}`);
            showBingo(answerPlayer, false); // 确保传入false参数
            return;
        }

        // 先检查是否已经达到最大猜测次数
        if (guessCount >= MAX_GUESSES - 1) {
            guessCount++;
            updateGuessCounter();
            clearInterval(timerInterval);
            showError(`已达到最大猜测次数(${MAX_GUESSES}次)，正确答案是 ${answerPlayer.name}`);
            showBingo(answerPlayer, false); // 确保传入false参数
            return;
        }

        const guessedPlayer = players.find(p => p.name === playerName);

        if (!guessedPlayer) {
            showError('未找到该球员');
            return;
        }

        // 增加猜测次数并更新显示
        guessCount++;
        updateGuessCounter();

        // 清空输入框
        document.getElementById('playerInput').value = '';

        // 检查是否猜对
        if (guessedPlayer.name === answerPlayer.name) {
            clearInterval(timerInterval);
            showBingo(answerPlayer, true);
            return;
        }

        // 创建年龄比较提示
        let ageHint = '';
        if (guessedPlayer.age < answerPlayer.age) {
            ageHint = ' <span class="age-hint-older">(older)</span>';
        } else if (guessedPlayer.age > answerPlayer.age) {
            ageHint = ' <span class="age-hint-younger">(younger)</span>';
        }

        // 添加位置和惯用脚的比较逻辑
        const hints = [
            { status: guessedPlayer.nationality === answerPlayer.nationality ? 'status-correct' : 
                     (continentMap[guessedPlayer.nationality] === continentMap[answerPlayer.nationality] ? 'status-close' : 'status-wrong') },
                     {
status:
    guessedPlayer.club === answerPlayer.club
        ? 'status-correct'
        : teamRegionMap[guessedPlayer.club] === teamRegionMap[answerPlayer.club]
            ? 'status-close'
            : 'status-wrong',
region: teamRegionMap[guessedPlayer.club] || 'Unknown'
},
            {status:
guessedPlayer.position === answerPlayer.position
  ? 'status-correct'
  : positionMap[guessedPlayer.position] === positionMap[answerPlayer.position]
    ? 'status-close'
    : 'status-wrong'
},



            { status: guessedPlayer.age === answerPlayer.age ? 'status-correct' : 
                  (Math.abs(guessedPlayer.age - answerPlayer.age) <= 2 ? 'status-close' : 'status-wrong') },
            { status: guessedPlayer.foot === answerPlayer.foot ? 'status-correct' : 'status-wrong' },
            
{
status:
  guessedPlayer.number === answerPlayer.number
    ? 'status-correct'
    : Math.abs(guessedPlayer.number - answerPlayer.number) <= 2
      ? 'status-close'
      : 'status-wrong',
},
{
status:
guessedPlayer.club === answerPlayer.club
  ? 'status-correct'
  : teamRegionMap[guessedPlayer.club] === teamRegionMap[answerPlayer.club]
    ? 'status-close'
    : 'status-wrong',
region: teamRegionMap[guessedPlayer.club] || 'Unknown'
}

];

        

        // 添加猜测历史，传递年龄提示
        addGuessToHistory(playerName, hints, ageHint);

        if (playerName === answerPlayer.name) {
            clearInterval(timerInterval);
            showBingo(guessedPlayer, true);
        }

        document.getElementById('playerInput').value = '';

    } catch (error) {
        console.error('Error:', error);
        showError('发生错误，请重试');
    }
}

        // 使用1.4版本的样式添加猜测历史，增加洲际判断
      
// 修改addGuessToHistory函数，添加foot和number的比较结果
function addGuessToHistory(playerName, hints, ageHint = '') {
    const historyContainer = document.getElementById('guessHistory');

    let table = document.querySelector('.result-table');

    if (!table) {
        table = document.createElement('table');
        table.className = 'result-table';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>NAME</th>
                <th>TEAM</th>
                <th>NAT</th>
                <th>AGE</th>
                <th>ROLE</th>
                <th>FOOT</th>
                <th>NUMBER</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        historyContainer.appendChild(table);
    }

    const tbody = table.querySelector('tbody');
    const player = players.find(p => p.name === playerName);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${player.name}</td>
        <td class="${hints[1].status} region-${hints[1].region?.replace(/\s/g, '-')}" title="${hints[1].region}">
${player.club}</td>

        <td class="${hints[0].status}">${player.nationality}</td>
        <td class="${hints[3].status}">${player.age}${ageHint}</td>
        <td class="${hints[2].status}">${player.position}</td>
        <td class="${hints[4].status}">${player.foot}</td>
        <td class="${hints[5].status}">${player.number}</td>

    `;

    tbody.insertBefore(row, tbody.firstChild);
}

function showError(message) {
    const input = document.getElementById('playerInput');
    input.style.borderColor = 'rgba(255, 0, 0, 0.5)';
    input.placeholder = message;
    input.value = '';

    setTimeout(() => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        input.placeholder = 'Type a player\'s name...';
    }, 2000);
}

function handleArrowKeys(direction) {
    const items = document.querySelectorAll('.autocomplete-item');
    items[selectedIndex]?.classList.remove('selected');

    selectedIndex = (selectedIndex + direction + filteredPlayers.length) % filteredPlayers.length;
    items[selectedIndex]?.classList.add('selected');

    // 更新输入框的值
    document.getElementById('playerInput').value = filteredPlayers[selectedIndex];
}

function selectPlayer(name) {
    document.getElementById('playerInput').value = name;
    document.getElementById('autocompleteList').style.display = 'none';
}

function handleKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const autocompleteList = document.getElementById('autocompleteList');
        
        if (autocompleteList.style.display === 'block' && selectedIndex >= 0) {
            document.getElementById('playerInput').value = filteredPlayers[selectedIndex];
            autocompleteList.style.display = 'none';
        }
        checkPlayer();
    }
}


    
    function showBingo(player, isWin = true) {
        const container = document.getElementById('bingoContainer');
        const resultText = document.getElementById('resultText');
        const info = document.getElementById('playerInfo');
        
        // 根据胜负设置不同的文本和样式
        if (isWin) {
            resultText.textContent = 'BINGO!';
            resultText.className = 'bingo-text win-text';
        } else {
            resultText.textContent = 'YOU LOSE';
            resultText.className = 'bingo-text lose-text';
        }
        
        info.innerHTML = `
            <h2>${player.name}</h2>
            <p>年龄: ${player.age}</p>
            <p>国籍: ${player.nationality}</p>
            <p>俱乐部: ${player.club}</p>
            <p>位置: ${player.position}</p>
            <p>惯用脚: ${player.foot}</p>
            <p>号码: ${player.number}</p>
            
        `;
        
        container.style.display = 'block';
    
        // 添加动画效果
        container.style.animation = 'fadeIn 0.5s';
    }

    // 页面加载时初始化
    window.addEventListener('DOMContentLoaded', async () => {
        await loadPlayers();
        updateGuessCounter();
        document.getElementById('timeLeft').textContent = timeLeft;
        
        // 添加重新开始按钮的事件监听
        document.getElementById('startAgainBtn').addEventListener('click', function() {
            location.reload(); // 刷新页面重新开始
        });
    });
    document.getElementById('ruleButton').onclick = function() {
        document.getElementById('ruleModal').style.display = 'block';
    }
    document.getElementById('closeButton').onclick = function() {
        document.getElementById('ruleModal').style.display = 'none';
    }
    // ... existing code ...
    // 删除这段重复的代码
    /*
        // 检查是否已经存在表格
        let table = document.querySelector('.result-table');
        
        if (!table) {
            // 如果是第一次猜测，创建表格和表头
            table = document.createElement('table');
            table.className = 'result-table';
            
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>NAME</th>
                    <th>TEAM</th>
                    <th>NAT</th>
                    <th>AGE</th>
                    <th>ROLE</th>
                </tr>
            `;
            table.appendChild(thead);
            
            // 创建tbody
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            
            historyContainer.appendChild(table);
        }
        
        // 添加新的数据行
        const tbody = table.querySelector('tbody');
        const player = players.find(p => p.name === playerName);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.name}</td>
            <td class="${hints[1].status}">${player.club}</td>
            <td class="${hints[0].status}">${player.nationality}</td>
            <td class="${hints[3].status}">${player.age}</td>
            <td class="${hints[2].status}">${player.position}</td>
        `;
        
        // 将新行插入到tbody的顶部
        tbody.insertBefore(row, tbody.firstChild);
    */
