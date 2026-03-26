module = {};
importScripts('fill.js');
onmessage = function(e) {
    let cmd = e.data;
    switch (cmd[0]) {
        case 'run':
            let words = cmd[1].split(/\n/);
            let grid = cmd[2];
            let isQuick = cmd[3];
            grid = grid.replace(/\./g, "#");
            grid = grid.replace(/ /g, ".");

            console.log("fill:\n" + grid);
            let wordlist = new module.exports.wordlist(words);
            let filler = new module.exports.filler(grid, wordlist);

            let progressCallback = null;
            if (!isQuick) {
                progressCallback = function(gridStr) {
                    let forced = gridStr.replace(/\./g, " ").replace(/#/g, ".");
                    postMessage(["forced", forced + "\n"]);
                };
            }

            let result = filler.fill(progressCallback);
            console.log("result:\n" + result);
            if (result.indexOf(".") == -1) {
              result = result.replace(/\./g, " ");
              result = result.replace(/#/g, ".");
              postMessage(["sat", result + "\n"]);
            } else {
              postMessage(["unsat"]);
            }
            postMessage(["done"]);
            break;
        case 'cancel':
            postMessage(["ack_cancel"]);
            break;
    }
};
