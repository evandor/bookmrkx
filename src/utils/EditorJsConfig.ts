// @ts-ignore
import Header from "@editorjs/header";
// @ts-ignore
import LinkTool from "@editorjs/link";
// @ts-ignore
import Quote from "@editorjs/quote";
// @ts-ignore
import ImageTool from "@editorjs/image";
// @ts-ignore
import Table from "@editorjs/table";
// @ts-ignore
import RawTool from "@editorjs/raw";
// @ts-ignore
import Checklist from "@editorjs/checklist";
// @ts-ignore
import editorjsColumns from "@calumk/editorjs-columns";
// @ts-ignore
import Alert from "editorjs-alert";
// @ts-ignore
import ColorPlugin from "editorjs-text-color-plugin";

import EditorJS, {OutputData} from "@editorjs/editorjs";
import {LinkTool2} from "src/pages/mainpanel/editorjs/linkTool"

class EditorJsConfig {

    column_tools = {
        header: Header,
        linkTool2: {
            class: LinkTool2,
            config: {
                endpoint: `/www/editor.html`, // Your backend endpoint for url data fetching,
            }
        }
        //alert : Alert,
        //paragraph : editorjsParagraphLinebreakable,
        //delimiter : Delimiter
    }

    toolsconfig = {
        header: {
            class: Header,
            shortcut: "CMD+SHIFT+H"
        },
        quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote\'s author',
            }
        },
        linkTool2: {
            class: LinkTool2,
            config: {
                endpoint: `/www/editor.html`, // Your backend endpoint for url data fetching,
            }
        },
        table: {
            class: Table,
            inlineToolbar: true,
            config: {
                rows: 2,
                cols: 3,
            },
        },
        columns: {
            class: editorjsColumns,
            config: {
                EditorJsLibrary: EditorJS,
                tools: this.column_tools
            }
        },
        image: {
            class: ImageTool,
            config: {
                /**
                 * Custom uploader
                 */
                uploader: {
                    /**
                     * Upload file to the server and return an uploaded image data
                     * @param {File} file - file selected from the device or pasted by drag-n-drop
                     * @return {Promise.<{success, file: {url}}>}
                     */
                    uploadByFile(file: any) {
                        // your own uploading logic here

                    },

                    /**
                     * Send URL-string to the server. Backend should load image by this URL and return an uploaded image data
                     * @param {string} url - pasted image URL
                     * @return {Promise.<{success, file: {url}}>}
                     */
                    uploadByUrl(url: string) {
                        // your ajax request for uploading


                    }
                }
            }
        },
        alert: Alert,
        Color: {
            class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
            config: {
                colorCollections: ['#EC7878','#9C27B0','#673AB7','#3F51B5','#0070FF','#03A9F4','#00BCD4','#4CAF50','#8BC34A','#CDDC39', '#FFF'],
                defaultColor: '#FF1300',
                type: 'text',
                customPicker: true // add a button to allow selecting any colour
            }
        },
        Marker: {
            class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
            config: {
                defaultColor: '#FFBF00',
                type: 'marker',
                icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`
            }
        }
    }



}

export default new EditorJsConfig();
