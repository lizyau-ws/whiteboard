document.addEventListener('DOMContentLoaded', () => {
    const whiteboard = document.getElementById('whiteboard');
    let selectedCard = null;
    let isDragging = false;
    let startX, startY;
    let currentTool = null;

    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    document.body.appendChild(toolbar);

    const tools = [
        { name: 'sticky-note', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V5h14v14z"/><path fill="currentColor" d="M15 7H9v2h6V7zm0 4H9v2h6v-2zm0 4H9v2h6v-2z"/></svg>', tooltip: 'Sticky Note' },
        { name: 'flip-card', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7h9v5h-9v-5zm-2 0v5H4v-5h5zm-5-6h16v4H4V6z"/><path fill="currentColor" d="M17 8l-3 3-3-3"/></svg>', tooltip: 'Flip Card' },
        { name: 'polling', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>', tooltip: 'Polling' },
        { name: 'wordcloud', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>', tooltip: 'Word Cloud' }
    ];
    
    tools.forEach(tool => {
        const button = document.createElement('button');
        button.innerHTML = tool.icon;
        button.classList.add('tool-btn');
        button.dataset.tool = tool.name;
        
        const tooltip = document.createElement('span');
        tooltip.className = 'tool-tooltip';
        tooltip.textContent = tool.tooltip;
        button.appendChild(tooltip);
        
        button.addEventListener('click', () => selectTool(tool.name));
        toolbar.appendChild(button);
    });

    function selectTool(toolName) {
        currentTool = toolName;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`.tool-btn[data-tool="${toolName}"]`).classList.add('selected');
        whiteboard.style.cursor = `url('data:image/svg+xml;utf8,${encodeURIComponent(tools.find(t => t.name === toolName).icon)}'), auto`;
    }

    whiteboard.addEventListener('click', (e) => {
        if (currentTool && e.target === whiteboard) {
            const element = createToolElement(currentTool);
            element.style.left = `${e.clientX}px`;
            element.style.top = `${e.clientY}px`;
            whiteboard.appendChild(element);
            selectCard(element);
            
            // Reset the tool and cursor after placing an element
            currentTool = null;
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('selected'));
            whiteboard.style.cursor = 'default';
        }
    });

    function createToolElement(toolName) {
        switch (toolName) {
            case 'sticky-note':
                return createStickyNote();
            case 'flip-card':
                return createFlipCard();
            case 'polling':
                return createPolling();
            // case 'wordcloud':
            //     return createWordCloud();
            default:
                console.error('Unknown tool');
                return null;
        }
    }

    function createStickyNote() {
        const note = document.createElement('div');
        note.className = 'sticky-note widget';
        note.innerHTML = '<textarea placeholder="Add a note..."></textarea>';
        addSelectionFrame(note);
        return note;
    }

    function createFlipCard() {
        const card = document.createElement('div');
        card.className = 'flip-card widget';
        
        const cardInner = document.createElement('div');
        cardInner.className = 'flip-card-inner';
        
        const frontSide = createCardSide('front');
        const backSide = createCardSide('back');
        
        cardInner.appendChild(frontSide);
        cardInner.appendChild(backSide);
        card.appendChild(cardInner);
        
        // Add hover effect
        const frontButton = frontSide.querySelector('.flip-btn');
        const backButton = backSide.querySelector('.flip-btn');
        
        frontButton.addEventListener('mouseenter', () => {
            cardInner.style.transform = 'rotateY(10deg)';
        });
        
        frontButton.addEventListener('mouseleave', () => {
            if (!card.classList.contains('flipped')) {
                cardInner.style.transform = 'rotateY(0deg)';
            }
        });
        
        backButton.addEventListener('mouseenter', () => {
            cardInner.style.transform = 'rotateY(170deg)';
        });
        
        backButton.addEventListener('mouseleave', () => {
            if (card.classList.contains('flipped')) {
                cardInner.style.transform = 'rotateY(180deg)';
            }
        });
        
        addSelectionFrame(card);
        return card;
    }
    
    function createCardSide(side) {
        const cardSide = document.createElement('div');
        cardSide.className = `flip-card-${side}`;
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'flip-card-content';
        
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Add text...';
        
        const flipBtn = document.createElement('button');
        flipBtn.className = 'flip-btn';
        flipBtn.textContent = 'Flip';
        flipBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.target.closest('.flip-card');
            card.classList.toggle('flipped');
            if (card.classList.contains('flipped')) {
                card.querySelector('.flip-card-inner').style.transform = 'rotateY(180deg)';
            } else {
                card.querySelector('.flip-card-inner').style.transform = 'rotateY(0deg)';
            }
        });
        
        contentContainer.appendChild(textarea);
        contentContainer.appendChild(flipBtn);
        cardSide.appendChild(contentContainer);
        
        return cardSide;
    }

    // function createWordCloud() {
    //     const wordCloud = document.createElement('div');
    //     wordCloud.className = 'wordcloud widget';
        
    //     const setupContainer = document.createElement('div');
    //     setupContainer.className = 'wordcloud-setup';
        
    //     const titleInput = document.createElement('input');
    //     titleInput.type = 'text';
    //     titleInput.placeholder = 'Enter title';
        
    //     const maxWordsInput = document.createElement('input');
    //     maxWordsInput.type = 'number';
    //     maxWordsInput.min = '1';
    //     maxWordsInput.max = '3';
    //     maxWordsInput.value = '3';
    //     maxWordsInput.placeholder = 'Max words per user (1-3)';
        
    //     const createButton = document.createElement('button');
    //     createButton.textContent = 'Create Word Cloud';
        
    //     setupContainer.appendChild(titleInput);
    //     setupContainer.appendChild(maxWordsInput);
    //     setupContainer.appendChild(createButton);
        
    //     const displayContainer = document.createElement('div');
    //     displayContainer.className = 'wordcloud-display';
    //     displayContainer.style.display = 'none';
        
    //     const title = document.createElement('h3');
    //     const wordContainer = document.createElement('div');
    //     wordContainer.className = 'word-container';
        
    //     displayContainer.appendChild(title);
    //     displayContainer.appendChild(wordContainer);
        
    //     wordCloud.appendChild(setupContainer);
    //     wordCloud.appendChild(displayContainer);
        
    //     createButton.addEventListener('click', () => {
    //         if (titleInput.value.trim() && maxWordsInput.value) {
    //             title.textContent = titleInput.value;
    //             setupContainer.style.display = 'none';
    //             displayContainer.style.display = 'block';
    //             openWordInputModal(parseInt(maxWordsInput.value), wordContainer);
    //         }
    //     });
        
    //     addSelectionFrame(wordCloud);
    //     return wordCloud;
    // }
    
    // function openWordInputModal(maxWords, container) {
    //     const modal = document.createElement('div');
    //     modal.className = 'word-input-modal';
        
    //     const form = document.createElement('form');
        
    //     for (let i = 0; i < maxWords; i++) {
    //         const input = document.createElement('input');
    //         input.type = 'text';
    //         input.placeholder = `Word ${i + 1}`;
    //         form.appendChild(input);
    //     }
        
    //     const submitButton = document.createElement('button');
    //     submitButton.type = 'submit';
    //     submitButton.textContent = 'Submit';
    //     form.appendChild(submitButton);
        
    //     form.addEventListener('submit', (e) => {
    //         e.preventDefault();
    //         const words = Array.from(form.querySelectorAll('input')).map(input => input.value.trim()).filter(Boolean);
    //         addWordsToCloud(words, container);
    //         modal.remove();
    //     });
        
    //     modal.appendChild(form);
    //     document.body.appendChild(modal);
    // }
    
    // function addWordsToCloud(words, container) {
    //     words.forEach(word => {
    //         let wordElement = container.querySelector(`[data-word="${word.toLowerCase()}"]`);
    //         if (wordElement) {
    //             const count = parseInt(wordElement.dataset.count) + 1;
    //             wordElement.dataset.count = count;
    //             wordElement.style.fontSize = `${16 + count * 2}px`;
    //         } else {
    //             wordElement = document.createElement('span');
    //             wordElement.textContent = word;
    //             wordElement.dataset.word = word.toLowerCase();
    //             wordElement.dataset.count = '1';
    //             wordElement.style.fontSize = '16px';
    //             wordElement.style.margin = '5px';
    //             wordElement.style.display = 'inline-block';
    //             container.appendChild(wordElement);
    //         }
    //     });
    // }

    function createPolling() {
        const polling = document.createElement('div');
        polling.className = 'polling widget';
        
        const questionInput = document.createElement('input');
        questionInput.type = 'text';
        questionInput.placeholder = 'Enter your question';
        
        const option1Input = document.createElement('input');
        option1Input.type = 'text';
        option1Input.placeholder = 'Option 1';
        
        const option2Input = document.createElement('input');
        option2Input.type = 'text';
        option2Input.placeholder = 'Option 2';
        
        const createButton = document.createElement('button');
        createButton.textContent = 'Create Poll';
        createButton.disabled = true;
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options';
        optionsContainer.appendChild(option1Input);
        optionsContainer.appendChild(option2Input);
        
        polling.appendChild(questionInput);
        polling.appendChild(optionsContainer);
        polling.appendChild(createButton);
        
        // Enable/disable create button based on inputs
        function checkInputs() {
            createButton.disabled = !(questionInput.value.trim() && option1Input.value.trim() && option2Input.value.trim());
        }
        
        questionInput.addEventListener('input', checkInputs);
        option1Input.addEventListener('input', checkInputs);
        option2Input.addEventListener('input', checkInputs);
        
        createButton.addEventListener('click', () => {
            // Create the poll
            const question = document.createElement('h3');
            question.textContent = questionInput.value;
            
            const options = [option1Input.value, option2Input.value].map((optionText, index) => {
                const option = document.createElement('div');
                option.className = 'option';
                
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `poll-${Date.now()}`;
                radio.id = `option-${index}`;
                
                const label = document.createElement('label');
                label.htmlFor = `option-${index}`;
                label.textContent = optionText;
                
                option.appendChild(radio);
                option.appendChild(label);
                return option;
            });
            
            // Clear the polling div and add the new elements
            polling.innerHTML = '';
            polling.appendChild(question);
            options.forEach(option => polling.appendChild(option));
        });
        
        addSelectionFrame(polling);
        return polling;
    }

    function addSelectionFrame(element) {
        const selectionFrame = document.createElement('div');
        selectionFrame.className = 'selection-frame';
        element.appendChild(selectionFrame);
    }

    function selectCard(card) {
        if (selectedCard) {
            selectedCard.classList.remove('selected');
        }
        selectedCard = card;
        selectedCard.classList.add('selected');
    }

    whiteboard.addEventListener('mousedown', (e) => {
        const card = e.target.closest('.widget');
        if (card) {
            selectCard(card);
            isDragging = true;
            startX = e.clientX - card.offsetLeft;
            startY = e.clientY - card.offsetTop;
        } else {
            if (selectedCard) {
                selectedCard.classList.remove('selected');
                selectedCard = null;
            }
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && selectedCard) {
            selectedCard.style.left = (e.clientX - startX) + 'px';
            selectedCard.style.top = (e.clientY - startY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Prevent dragging when interacting with textarea or button
    whiteboard.addEventListener('mousedown', (e) => {
        if (e.target.closest('textarea') || e.target.closest('button') || e.target.closest('input')) {
            e.stopPropagation();
        }
    }, true);

    // Add event listener for delete key
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCard) {
        // Prevent the default action of the Backspace key
        e.preventDefault();
        selectedCard.remove();
        selectedCard = null;
    }
});
});

console.log('Script loaded');