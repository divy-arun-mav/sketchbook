document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('whiteboard');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let drawingMode = null;
    let startX, startY;
    let history = [];
    let redoList = [];

    const saveState = () => {
        history.push(canvas.toDataURL());
        redoList = [];
    };

    const undo = () => {
        if (history.length > 0) {
            redoList.push(history.pop());
            const imgData = new Image();
            if (history.length > 0) {
                imgData.src = history[history.length - 1];
            } else {
                imgData.src = '';
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            imgData.onload = () => ctx.drawImage(imgData, 0, 0);
        }
    };

    const redo = () => {
        if (redoList.length > 0) {
            const imgData = new Image();
            const data = redoList.pop();
            history.push(data);
            imgData.src = data;
            imgData.onload = () => ctx.drawImage(imgData, 0, 0);
        }
    };

    const resizeCanvas = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = 600;
    };
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'white';

    const drawShape = (type, x1, y1, x2, y2) => {
        switch (type) {
            case 'line':
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.closePath();
                break;
            case 'rectangle':
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                break;
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x1, y2);
                ctx.closePath();
                ctx.stroke();
                break;
            case 'rightTriangle':
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x2, y1);
                ctx.closePath();
                ctx.stroke();
                break;
            case 'kite':
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo((x1 + x2) / 2, y2);
                ctx.lineTo(x2, y1);
                ctx.lineTo((x1 + x2) / 2, (y1 + y2) / 2);
                ctx.closePath();
                ctx.stroke();
                break;
            case 'pentagon':
                const pentagonRadius = Math.hypot(x2 - x1, y2 - y1) / 2;
                const pentagonAngle = (2 * Math.PI) / 5;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const theta = i * pentagonAngle;
                    const px = x1 + pentagonRadius * Math.cos(theta);
                    const py = y1 + pentagonRadius * Math.sin(theta);
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 'arrow':
                const headlen = 10;
                const angle = Math.atan2(y2 - y1, x2 - x1);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
                ctx.moveTo(x2, y2);
                ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
                ctx.stroke();
                break;
            case 'star':
                const spikes = 5;
                const outerRadius = Math.hypot(x2 - x1, y2 - y1) / 2;
                const innerRadius = outerRadius / 2.5;
                const cx = (x1 + x2) / 2;
                const cy = (y1 + y2) / 2;
                let rot = Math.PI / 2 * 3;
                let step = Math.PI / spikes;

                ctx.beginPath();
                ctx.moveTo(cx, cy - outerRadius);
                for (let i = 0; i < spikes; i++) {
                    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
                    rot += step;
                    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
                    rot += step;
                }
                ctx.lineTo(cx, cy - outerRadius);
                ctx.closePath();
                ctx.stroke();
                break;
        }
    };

    canvas.addEventListener('mousedown', (e) => {
        startX = e.offsetX;
        startY = e.offsetY;
        drawing = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (drawing) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (history.length > 0) {
                const imgData = new Image();
                imgData.src = history[history.length - 1];
                imgData.onload = () => {
                    ctx.drawImage(imgData, 0, 0);
                    drawShape(drawingMode, startX, startY, e.offsetX, e.offsetY);
                };
            } else {
                drawShape(drawingMode, startX, startY, e.offsetX, e.offsetY);
            }
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (drawing) {
            drawShape(drawingMode, startX, startY, canvas.width, canvas.height);
            saveState();
        }
        drawing = false;
    });

    canvas.addEventListener('mouseleave', () => {
        drawing = false;
    });

    document.getElementById('clear').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
    });

    document.getElementById('undo').addEventListener('click', () => {
        undo();
    });

    document.getElementById('redo').addEventListener('click', () => {
        redo();
    });

    const buttons = document.querySelectorAll('#controls button:not(#clear):not(#undo):not(#redo)');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            drawingMode = button.id.replace('draw', '').toLowerCase();
            buttons.forEach(btn => btn.disabled = false);
            button.disabled = true;
        });
    });

    document.getElementById('colorPicker').addEventListener('input', (e) => {
        ctx.strokeStyle = e.target.value;
    });
});