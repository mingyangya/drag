// todo 元素拖动
class DragEle {
    constructor() {
        this.defaultOpt = {
            deviation: 0,//误差3个像素
            left: 0,
            top: 0,
            sourceEle: document.querySelector('.drag_block'),
            distEle: document.querySelector('.drag_body'),
            zoom: false,
        };
    }

    init(opt) {
        this.opt = Object.assign({}, this.defaultOpt, opt);
        this.initParams();
        this.render();
        this.dragstart();
        this.dropEle();
    }

    getStyle(ele, style) {
        //todo 获取元素样式
        return ele.currentStyle ? ele.currentStyle[style] : window.getComputedStyle(ele, null)[style];
    }

    initParams() {
        this.distEleW = this.opt.distEle.clientWidth - Math.round(this.getStyle(this.opt.distEle, 'padding-left').split('px')[0]) - Math.round(this.getStyle(this.opt.distEle, 'padding-right').split('px')[0]);
        this.distEleH = this.opt.distEle.clientHeight - Math.round(this.getStyle(this.opt.distEle, 'padding-top').split('px')[0]) - Math.round(this.getStyle(this.opt.distEle, 'padding-bottom').split('px')[0]);

        this.sourceEleW = this.opt.sourceEle.clientWidth - Math.round(this.getStyle(this.opt.sourceEle, 'padding-left').split('px')[0]) - Math.round(this.getStyle(this.opt.sourceEle, 'padding-right').split('px')[0]);
        this.sourceEleH = this.opt.sourceEle.clientHeight - Math.round(this.getStyle(this.opt.sourceEle, 'padding-top').split('px')[0]) - Math.round(this.getStyle(this.opt.sourceEle, 'padding-bottom').split('px')[0]);
        this.getTruePoint();
        return {
            distEleW: this.distEleW,
            distEleH: this.distEleH,
            sourceEleW: this.sourceEleW,
            sourceEleH: this.sourceEleH
        }
    }

    getTruePoint() {
        this.safePos = {
            x: [0 + Math.round(this.getStyle(this.opt.distEle, 'padding-left').split('px')[0]), this.distEleW - this.sourceEleW],
            y: [0 + Math.round(this.getStyle(this.opt.distEle, 'padding-top').split('px')[0]), this.distEleH - this.sourceEleH]
        }
        // 安全区域
        return this.safePos;
    }
    render() {

        const _position = ['relative', 'absolute', 'fixed', 'sticky'];
        // 初始化包裹元素的位置
        (!_position.includes(this.getStyle(this.opt.distEle, 'position'))) && (this.opt.distEle.style.position = _position[0]);

        // 初始化拖动元素的位置
        (this.getStyle(this.opt.sourceEle, 'position') !== _position[1]) && (this.opt.sourceEle.style.position = _position[1]);
        const { safe, top2, left2 } = this.handlePos({ x: Math.round(this.getStyle(this.opt.sourceEle, 'left').split('px')[0]), y: Math.round(this.getStyle(this.opt.sourceEle, 'top').split('px')[0]) })
        !safe && (this.opt.sourceEle.style.top = top2 + 'px') && (this.opt.sourceEle.style.left = left2 + 'px')


        if (this.opt.zoom) { //放大，缩小功能
            this.opt.sourceEle.style.resize = "both";
            this.opt.sourceEle.style.overflow = "auto";
        }
    }
    // 转换位置，使其在安全范围内
    handlePos(pos = { x: 0, y: 0 }) {
        let left2 = 0,
            top2 = 0,
            safe = true;// 安全区域
        if ((pos.x >= this.safePos.x[0]) && (pos.x <= this.safePos.x[1])) {
            console.log("x在区间内")
            left2 = pos.x;
        } else {
            console.error("x不在区间内")
            left2 = pos.x < this.safePos.x[0] ? this.safePos.x[0] : this.safePos.x[1];
            safe = false;
        }

        if ((pos.y >= this.safePos.y[0]) && (pos.y <= this.safePos.y[1])) {
            console.log("y在区间内")
            top2 = pos.y
        } else {
            console.error("y不在区间内")
            safe = false;
            top2 = pos.y < this.safePos.y[0] ? this.safePos.y[0] : this.safePos.y[1];
        }

        return {
            left2,
            top2,
            safe
        }
    }
    dragstart() {
        //监听拖拽元素开始事件
        this.opt.sourceEle.ondragstart = (e) => {
            let ele = e.target;
            if (ele.nodeName === "IMG") {
                ele = ele.parentNode;
                // e.preventDefault();
            }

            const data = {
                className: ele.className,
                w: ele.clientWidth,
                h: ele.clientHeight,
                top: Math.round(this.getStyle(this.opt.sourceEle, 'top').split('px')[0]),
                left: Math.round(this.getStyle(this.opt.sourceEle, 'left').split('px')[0]),
                point: {
                    x: e.clientX,
                    y: e.clientY
                }
            };
            console.log("+++开始坐标top,left", data.top, data.left,'+++')
            e.dataTransfer.setData("Text", JSON.stringify(data));
        };
    }

    dragover() {
        this.opt.distEle.ondragover = function (e) {
            e.preventDefault();
        };
    }



    dropEle() {
        this.dragover();
        const that = this;
        this.opt.distEle.ondrop = function (e) {
            e.preventDefault();

            if (e.type === "drop") {
                const
                    dragData = e.dataTransfer.getData("Text"),
                    args = JSON.parse(dragData),
                    { top, left } = args,
                    x1 = args.point.x, // 拖动前的位置坐标 x
                    y1 = args.point.y, // 拖动前的位置坐标 y
                    distance = {
                        x: e.clientX - x1, // 偏移量x
                        y: e.clientY - y1 // 偏移量y
                    }

                const { left2, top2 } = that.handlePos({ x: left + distance.x, y: top + distance.y });

                console.log("---结束坐标top,left", top2, left2,'---')
                // 拖拽完成后的方法
                that.opt.dropCb && that.opt.dropCb({ left: left2, top: top2, w: that.sourceW, h: that.sourceH });

            }
        };
    }

    // zoom(sourceEle) {

    // }
}

const drag=new DragEle();

// export {
//     drag
// };

