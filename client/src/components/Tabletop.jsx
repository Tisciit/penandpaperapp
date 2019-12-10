import React, { useEffect, useRef } from "react";
import "./Tabletop.css";

export const Tabletop = (props) => {

    const refSvg = useRef(null);

    const R = 5;
    const COLS = props.cols || 20;
    const ROWS = props.rows || 20; //These may be cut off by the div
    const SVGWIDTH = COLS * (R * 1.5);
    const SVGHEIGHT = ROWS * (R * 1.5);
    
    const viewBox = `0 0 ${SVGWIDTH} ${SVGHEIGHT}`;


    //Thanks to https://stackoverflow.com/a/56823542/12512574 for basically providing the SVG Hex Layout creation script!
    useEffect(() => {
        const SVG_NS = 'http://www.w3.org/2000/svg';

        const H = SVGHEIGHT, W = SVGWIDTH
        const h = R * Math.sin(Math.PI / 3);
        const offset = 1.5 * R;

        let i = 0;
        for (let y = 0; y < H; y += h) {
            i++
            let o = (i % 2 === 0) ? offset : 0;
            for (let x = o; x < W; x += 3 * R) {
                calulcateEdges(x, y)
            }
        }

        function calulcateEdges(x, y) {
            let points = ""

            //for a given xy, calculate the points for the 6 edges at 0 - 6 pi / 3
            for (let a = 0; a < 6; a++) {
                let o = {}
                o.x = x + R * Math.cos(a * Math.PI / 3);
                o.y = y + R * Math.sin(a * Math.PI / 3);
                points += `${o.x}, ${o.y} `
            }
            appendSVGelmt({ points: points }, "polygon", refSvg.current)
        }


        function appendSVGelmt(o, tag, parent) {

            let elmt = document.createElementNS(SVG_NS, tag);
            for (let name in o) {
                if (o.hasOwnProperty(name)) {
                    elmt.setAttributeNS(null, name, o[name]);
                }
            }
            parent.appendChild(elmt);
            return elmt;
        }
    }, []);

    //


    //points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"
    return (
        <div className="tabletopWrapper">
            <svg ref={refSvg} viewBox={viewBox} />
        </div >
    )
}