import {Tab} from "src/models/Tab";
import {Placeholders, PlaceholdersType} from "src/models/Placeholders";
import {uid} from "quasar";

class IDrawUtils {

    createText(name: string):object {
        return {
            name,
            x: 160,
            y: 80,
            w: 180,
            h: 30,
            angle: 0,
            type: "text",
            desc: {
                text: 'Text',
                color: "#3f51b5",
                fontSize: 18,
                textAlign: 'center',
                bgColor: "white",
                borderRadius: 10,
                borderWidth: 0,
                borderColor: "#3f51b5",
            },
            operation: {
                //lock : true,
                disableRotate: true
            }
        }
    }

    createRectangle (name: string = "rect-" + uid()) {
        return {
            name,
            x: 150,
            y: 70,
            w: 100,
            h: 100,
            angle: 0,
            type: "rect",
            desc: {
                color: "#3f51b5",
                bgColor: "#3f51b51f",
                borderRadius: 10,
                borderWidth: 2,
                borderColor: "#3f51b5",
            },
        }
    }

    createLine (name: string = "line-" + uid()) {
        return {
            name,
            x: 140,
            y: 120,
            w: 200,
            h: 0,
            type: "rect",
            desc: {
                bgColor: "#f7d3c1",
                borderRadius: 0,
                borderWidth: 1,
                borderColor: "#000066",
            },
        }
    }

    createTab(t: Tab, y: number) {
        return {
            name: "tab-" + t.id,
            uuid: t.id,
            x: t.canvasLeft || 40,
            y: y,
            w: t.canvasWidth || 180,
            h: t.canvasHeight || 28,
            type: "text",
            desc: {
                text: t.name || t.title,
                color: "#3f51b5",
                fontSize: 14,
                textAlign: 'center',
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "black",
            },
            operation: {
                //lock : true,
                disableRotate: true
            }
        }
    }
}

export default new IDrawUtils();
