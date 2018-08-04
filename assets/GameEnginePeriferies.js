export class GameEnginePeriferies {
    constructor(engine) {
        this.engine = engine;
        this.mouse = {
            button: null,
            buttons: 0,
            buttonList: [],
            position: {
                current: {
                    x: null,
                    y: null
                },
                previous: {
                    x: null,
                    y: null
                }
            }
        };
        this.keyboard = {
            key: null,
            keys: []
        };
        this.touch = {
            points: []
        };
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.isWatchMouse = false;
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.isWatchKeyboard = false;
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.isWatchTouch = false;
    }
    watchMouse() {
        if (!this.isWatchMouse){
            this.isWatchMouse = true;
            this.engine.canvas.addEventListener('mouseenter', this.onMouseEnter);
            this.engine.canvas.addEventListener('mouseleave', this.onMouseLeave);
            this.engine.canvas.addEventListener('mousemove', this.onMouseMove);
            this.engine.canvas.addEventListener('mousedown', this.onMouseDown);
            this.engine.canvas.addEventListener('mouseup', this.onMouseUp);
        }
    }
    unwatchMouse() {
        if (this.isWatchMouse) {
            this.isWatchMouse = false;
            this.engine.canvas.removeEventListener('mouseenter', this.onMouseEnter);
            this.engine.canvas.removeEventListener('mouseleave', this.onMouseLeave);
            this.engine.canvas.removeEventListener('mousemove', this.onMouseMove);
            this.engine.canvas.removeEventListener('mousedown', this.onMouseDown);
            this.engine.canvas.removeEventListener('mouseup', this.onMouseUp);
        }
    }
    onMouseEnter(e) {
        e.preventDefault();
        this.mouse.position.current.x = e.clientX;
        this.mouse.position.current.y = e.clientY;
        this.mouse.position.previous.x = null;
        this.mouse.position.previous.y = null;
        // this.mouse.button = e.button;
        // this.mouse.buttons = e.buttons;
    }
    onMouseLeave(e) {
        e.preventDefault();
        this.mouse.position.current.x = null;
        this.mouse.position.current.y = null;
        this.mouse.position.previous.x = this.mouse.position.current.x;
        this.mouse.position.previous.y = this.mouse.position.current.y;
        // this.mouse.button = e.button;
        // this.mouse.buttons = e.buttons;
    }
    onMouseMove(e) {
        e.preventDefault();
        this.mouse.position.previous.x = this.mouse.position.current.x;
        this.mouse.position.previous.y = this.mouse.position.current.y;
        this.mouse.position.current.x = e.clientX;
        this.mouse.position.current.y = e.clientY;
        // this.mouse.button = e.button;
        // this.mouse.buttons = e.buttons;
    }
    onMouseDown(e) {
        e.preventDefault();
        this.mouse.position.previous.x = this.mouse.position.current.x;
        this.mouse.position.previous.y = this.mouse.position.current.y;
        this.mouse.position.current.x = e.clientX;
        this.mouse.position.current.y = e.clientY;
        this.mouse.button = e.button;
        this.mouse.buttons = e.buttons;
        if (this.mouse.buttonList.indexOf(e.button) < 0) {
            this.mouse.buttonList.push(e.button);
        }
        e.preventDefault();
    }
    onMouseUp(e) {
        e.preventDefault();
        this.mouse.position.previous.x = this.mouse.position.current.x;
        this.mouse.position.previous.y = this.mouse.position.current.y;
        this.mouse.position.current.x = e.clientX;
        this.mouse.position.current.y = e.clientY;
        this.mouse.button = e.button;
        this.mouse.buttons = e.buttons;
        while (true) {
            const i = this.mouse.buttonList.indexOf(e.button);
            if (i > -1) {
                this.mouse.buttonList.splice(i, 1);
            } else {
                break;
            }
        }
        e.preventDefault();
    }
    watchKeyboard() {
        if (!this.isWatchKeyboard) {
            this.isWatchKeyboard = true;
            document.body.addEventListener('keydown', this.onKeyDown);
            document.body.addEventListener('keypress', this.onKeyPress);
            document.body.addEventListener('keyup', this.onKeyUp);
        }
    }
    unwatchKeyboard(){
        if (this.isWatchKeyboard) {
            this.isWatchKeyboard = false;
            document.body.removeEventListener('keydown', this.onKeyDown);
            document.body.removeEventListener('keypress', this.onKeyPress);
            document.body.removeEventListener('keyup', this.onKeyUp);
        }
    }
    onKeyDown(e) {
        if (e.repeat){
            if (this.keyboard.keys.indexOf(e.key) > -1) {
                return;
            }
        }
        this.keyboard.keys.push(e.key);
    }
    onKeyPress(e) {
        this.keyboard.key = e.key;
    }
    onKeyUp(e) {
        this.keyboard.key = null;
        while(true) {
            const i = this.keyboard.keys.indexOf(e.key);
            if (i > -1) {
                this.keyboard.keys.splice(i, 1);
            } else {
                break;
            }
        }
    }

    watchTouch() {
        if (!this.isWatchTouch) {
            this.isWatchTouch = true;
            this.engine.canvas.addEventListener('touchstart', this.onTouchStart, {
                passive: false
            });
            this.engine.canvas.addEventListener('touchmove', this.onTouchMove, {
                passive: false
            });
            this.engine.canvas.addEventListener('touchend', this.onTouchEnd);
        }
    }
    unwatchTouch() {
        if (this.isWatchTouch) {
            this.isWatchTouch = false;
            this.engine.canvas.removeEventListener('touchstart', this.onTouchStart);
            this.engine.canvas.removeEventListener('touchmove', this.onTouchMove);
            this.engine.canvas.removeEventListener('touchend', this.onTouchEnd);
        }
    }
    onTouchStart(e) {
        e.preventDefault();
        console.log('start',e);
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const index = this.touch.points.findIndex(t => {return t.id == touch.identifier});
            if (index < 0) {
                this.touch.points.push(getTouchInfo(touch));
            } else {
                this.touch.points[index] = getTouchInfo(touch);
            }
        }
    }
    onTouchMove(e) {
        e.preventDefault();
        console.log('start',e);
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const index = this.touch.points.findIndex(t => {return t.id == touch.identifier});
            if (index < 0) {
                this.touch.points.push(getTouchInfo(touch));
            } else {
                this.touch.points[index] = getTouchInfo(touch);
            }
        }
    }
    onTouchEnd(e) {
        e.preventDefault();
        console.log('end', e);
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            while(true) {
                const i = this.touch.points.findIndex(t => {return t.id == touch.identifier});
                if (i > -1)  {
                    this.touch.points.splice(i, 1);
                } else {
                    break;
                }
            }
        };
    }
}

/**
 * 
 * @param {Touch} e 
 */
function getTouchInfo(e) {
    const info = {
        id: e.identifier,
        x: e.clientX,
        y: e.clientY,
        radiusX: e.radiusX || 1,
        radiusY: e.radiusY || 1,
        angle: e.rotationAngle || 0,
        force: e.force || 1
    };
    return info;
}

/**
 * 
 * @param {PointerEvent} e 
 */
function getPointerInfo(e) {
    const info = {
        id: e.pointerId,
        type: e.pointerType,
        x: e.clientX,
        y: e.clientY,
        tiltX: e.tiltX,
        tiltY: e.tiltY
    }
    return info;
}