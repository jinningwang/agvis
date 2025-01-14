const table_html = `
<table style="width: 100%;">
    <tr>
        <td>DiME hostname/port</td>
        <td style="white-space: nowrap;"><input type="text" name="opt_dimehost" size="9"> : <input type="text" name="opt_dimeport" pattern="[0-9]*(\.[0-9]*)?" size="5"></td>
    </tr>
    <tr>
        <td><span name="opt_alabel">V Angle (rad) min/max</span></td>
        <td style="white-space: nowrap;"><input type="text" name="opt_amin" pattern="[0-9]*(\.[0-9]*)?" size="7"> - <input type="text" name="opt_amax" pattern="[0-9]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td><span name="opt_vlabel">V Magnitude (p.u.) min/max</span></td>
        <td style="white-space: nowrap;"><input type="text" name="opt_vmin" pattern="[0-9]*(\.[0-9]*)?" size="7"> - <input type="text" name="opt_vmax" pattern="[0-9]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td><span name="opt_flabel">Frequency (p.u.) min/max</span></td>
        <td style="white-space: nowrap;"><input type="text" name="opt_fmin" pattern="[0-9]*(\.[0-9]*)?" size="7"> - <input type="text" name="opt_fmax" pattern="[0-9]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td><span name="opt_flabel">Edge opacity</span></td>
        <td style="white-space: nowrap;"><input type="text" name="opt_opacity" pattern="[01]*(\.[0-9]*)?" size="7"></td>
    </tr>
    <tr>
        <td><label for="opt_togglehandshake">Toggle Handshake</label></td>
        <td><input type="checkbox" name="opt_togglehandshake" checked></td>
    </tr>
    <tr>
        <td><label for="opt_togglezones">Toggle Zones</label></td>
        <td><input type="checkbox" name="opt_togglezones" checked></td>
    </tr>
    <tr>
        <td><label for="opt_togglebuslabels">Toggle Bus Labels</label></td>
        <td><input type="checkbox" name="opt_togglebuslabels"></td>
    </tr>
</table>
<div>
    <input type="button" value="Load config" name="opt_loadconfig">
    <input type="button" value="Save config" name="opt_saveconfig">
</div>
<div>
    <input type="button" value="Load simulation" name="opt_loadsimulation">
    <input type="button" value="Save simulation" name="opt_savesimulation">
</div>

<hr>
<h3>Timestamp Settings</h3>

<div>
    <label for="ny">Use Timestamp?</label>
    <select name="ny" id="ny">
        <option select="selected" value="No">No</option>
        <option value="Yes">Yes</option>
    </select>
    
</div>
<div>
    <label for="ts_date">Select a Date:</label>
    <input type="date" id="ts_date" name="ts_date">
</div>

<div>
    <label for="ts_time">Select a Time:</label>
    <input type="time" id="ts_time" value="00:00:00" name="ts_time">
</div>

<div>
    <label for="ts_inc">Select an Increment:</label>
    <select name="ts_inc" id="ts_inc">
        <option select="selected" value="ms">Milliseconds</option>
        <option value="s">Seconds</option>
        <option value="min">Minutes</option>
        <option value="h">Hours</option>
        <option value="day">Days</option>
    </select>
    <br>
    
    <label for="ts_num">Number of Increments per Second:</label>
    <input type="number" id="ts_num" name="ts_num" value="1" min="0" step="1">
</div>

<div>
</div>
<div>
    <label for="ts_up">Update Settings?</label>
    <input type="button" value="Update" id="ts_up" name="ts_up">
</div>
`

const SIDEBAR_CALLBACKS = [];

class DimeInfo {
    constructor(host, port) {
        this.host = host;
        this.port = port;

        Object.freeze(this);
    }
}

function addSidebarConfig(win, options, sidebar) {
    const table_id = "configpanel" + win.num;

    sidebar.addPanel({
        id: table_id,
        tab: '<span>\u2699</span>',
        pane: table_html,
        title: 'Configuration settings'

    });

    const opt_dimehost = document.querySelector(`#${table_id} input[name='opt_dimehost']`);
    const opt_dimeport = document.querySelector(`#${table_id} input[name='opt_dimeport']`);
    const opt_amin = document.querySelector(`#${table_id} input[name='opt_amin']`);
    const opt_amax = document.querySelector(`#${table_id} input[name='opt_amax']`);
    const opt_vmin = document.querySelector(`#${table_id} input[name='opt_vmin']`);
    const opt_vmax = document.querySelector(`#${table_id} input[name='opt_vmax']`);
    const opt_fmin = document.querySelector(`#${table_id} input[name='opt_fmin']`);
    const opt_fmax = document.querySelector(`#${table_id} input[name='opt_fmax']`);
    const opt_opacity = document.querySelector(`#${table_id} input[name='opt_opacity']`);
    const opt_togglezones = document.querySelector(`#${table_id} input[name='opt_togglezones']`);
    const opt_togglebuslabels = document.querySelector(`#${table_id} input[name='opt_togglebuslabels']`);

    const opt_loadconfig = document.querySelector(`#${table_id} input[name='opt_loadconfig']`);
    const opt_saveconfig = document.querySelector(`#${table_id} input[name='opt_saveconfig']`);
    const opt_loadsimulation = document.querySelector(`#${table_id} input[name='opt_loadsimulation']`);
    const opt_savesimulation = document.querySelector(`#${table_id} input[name='opt_savesimulation']`);

    const opt_alabel = document.querySelector(`#${table_id} span[name='opt_alabel']`);
    const opt_vlabel = document.querySelector(`#${table_id} span[name='opt_vlabel']`);
    const opt_flabel = document.querySelector(`#${table_id} span[name='opt_flabel']`);

    const ts_up = document.querySelector(`#${table_id} input[name='ts_up']`);
    
    //Updating function for Timestamp
    ts_up.onclick = function() {
    
        let dval = document.getElementById("ts_date").value;
        let nval = Number(document.getElementById("ts_num").value);
        let yval = document.getElementById("ny").value;
        let tval = document.getElementById("ts_time").value;
        
    
        //If the Timestamp isn't being used, don't bother checking for good inputs
        if (yval === "No") {
            
            
            //The Timestamp is updated based on where in the simulation the timer is on.
            if (win.workspace.Vargs) {
            
                win.simTimeBox.update(win.workspace.Varvgs.t.toFixed(2));
            }
        
            //If there is no simulation, set it to 0.
            else {
            
                win.simTimeBox.update(0.00);
            }
        }
        
        else {
            
            //Make sure all fully user provided inputs are proper. If not, throw an alert.
            if ((dval == "") || (nval < 0) || (!(Number.isFinite(nval))) || (tval == "")) {
                
                alert("Please set all inputs properly before trying to update.");
                return;
            }

            if (win.workspace.Vargs) {
                
                
                win.simTimeBox.update(win.workspace.Varvgs.t.toFixed(2));
            
            }
        
            else {
                
                win.simTimeBox.update(0.00);
            }
        
        }

    };
     
    function updateInputs() {
        if ("dimehost" in options) {
            opt_dimehost.value = options.dimehost;
        }

        if ("dimeport" in options) {
            opt_dimeport.value = options.dimeport;
        }

        if ("amin" in options) {
            opt_amin.value = options.amin;
        }

        if ("amax" in options) {
            opt_amax.value = options.amax;
        }

        if ("vmin" in options) {
            opt_vmin.value = options.vmin;
        }

        if ("vmax" in options) {
            opt_vmax.value = options.vmax;
        }

        if ("fmin" in options) {
            opt_fmin.value = options.fmin;
        }

        if ("fmax" in options) {
            opt_fmax.value = options.fmax;
        }

        if ("opacity" in options) {
            opt_opacity.value = options.opacity;
        }

        if ("togglezones" in options) { // TODO
            opt_togglezones.checked = options.togglezones;
        }

        if ("togglebuslabels" in options) {
            opt_togglebuslabels.checked = options.togglebuslabels;
        }

        if ("alabel" in options) {
            opt_alabel.innerHTML = options.alabel + " min/max";
        }

        if ("vlabel" in options) {
            opt_vlabel.innerHTML = options.vlabel + " min/max";
        }

        if ("flabel" in options) {
            opt_flabel.innerHTML = options.flabel + " min/max";
        }
    };

    win.dime_updated = function() {
        return new Promise(function(resolve, reject) {
            let callback = function() {
                const host = opt_dimehost.value;
                const port = Number(opt_dimeport.value);

                if (port === port) {
                    options.dimehost = host;
                    options.dimeport = port;

                    let dt = new Date();
                    dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
                    dt = dt.toUTCString();

                    document.cookie = `dimehost${win.num}=${host};expires=${dt};path=/`;
                    document.cookie = `dimeport${win.num}=${port};expires=${dt};path=/`;

                    resolve(new DimeInfo(host, port));
                }
            };

            opt_dimehost.oninput = callback;
            opt_dimeport.oninput = callback;
        });
    };

    opt_amin.oninput = function() {
        const val = Number(opt_amin.value);

        if (val === val) {
            options.amin = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amin${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "theta") {
                win.contourLayer.updateRange(options.amin, options.amax);
            }
        }
    }

    opt_amax.oninput = function() {
        const val = Number(opt_amax.value);

        if (val === val) {
            options.amax = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `amax${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "theta") {
                win.contourLayer.updateRange(options.amax, options.amax);
            }
        }
    };

    opt_vmin.oninput = function() {
        const val = Number(opt_vmin.value);

        if (val === val) {
            options.vmin = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmin${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "V") {
                win.contourLayer.updateRange(options.vmin, options.vmax);
            }
        }
    };

    opt_vmax.oninput = function() {
        const val = Number(opt_vmax.value);

        if (val === val) {
            options.vmax = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `vmax${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "V") {
                win.contourLayer.updateRange(options.vmin, options.vmax);
            }
        }
    }

    opt_fmin.oninput = function() {
        const val = Number(opt_fmin.value);

        if (val === val) {
            options.fmin = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmin${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "freq") {
                win.contourLayer.updateRange(options.fmin, options.fmax);
            }
        }
    };

    opt_fmax.oninput = function() {
        const val = Number(opt_fmax.value);

        if (val === val) {
            options.fmax = val;

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `fmax${win.num}=${val};expires=${dt};path=/`;

            if (win.contourLayer.variableName === "freq") {
                win.contourLayer.updateRange(options.fmin, options.fmax);
            }
        }
    };

    opt_opacity.oninput = function() {
        const val = Number(opt_opacity.value);

        if (val === val) {
            options.opacity = val;

            win.topologyLayer._opacity = val;
            win.topologyLayer.redraw();

            let dt = new Date();
            dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
            dt = dt.toUTCString();

            document.cookie = `opacity${win.num}=${val};expires=${dt};path=/`;
        }
    };

    opt_togglezones.onclick = function() {
        win.zoneLayer.toggleRender();

        const val = win.zoneLayer._render;

        opt_togglezones.checked = val;
        options.togglezones = val;

        let dt = new Date();
        dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
        dt = dt.toUTCString();

        document.cookie = `togglezones${win.num}=${val};expires=${dt};path=/`;
    };

    opt_togglebuslabels.onclick = function() {
        const val = opt_togglebuslabels.checked;

        win.topologyLayer._render_bus_ids = val;
        win.topologyLayer.redraw();
        options.togglebuslabels = val;

        let dt = new Date();
        dt.setTime(dt.getTime() + (365 * 24 * 60 * 60 * 1000));
        dt = dt.toUTCString();

        document.cookie = `togglebuslabels${win.num}=${val};expires=${dt};path=/`;
    };

    const opt_loadconfig_input = document.createElement("input");

    opt_loadconfig_input.style.display = "none";
    opt_loadconfig_input.type = "file";
    document.body.appendChild(opt_loadconfig_input);

    opt_loadconfig_input.onchange = function() {
        if (opt_loadconfig_input.files.length > 0) {
            let fr = new FileReader();

            fr.onload = function(file) {
                let newoptions = JSON.parse(file.target.result);
                Object.assign(options, newoptions);

                for (let func of SIDEBAR_CALLBACKS) {
                    func();
                }
            }

            fr.readAsText(opt_loadconfig_input.files[0]);
        }
    };

    opt_loadconfig.onclick = function() {
        opt_loadconfig_input.click();
    };

    const opt_saveconfig_a = document.createElement("a");

    opt_saveconfig_a.style.display = "none";
    document.body.appendChild(opt_saveconfig_a);

    opt_saveconfig.onclick = function() {
        let json = JSON.stringify(options);
        let blob = new Blob([json], {type: "application/json"});

        opt_saveconfig_a.href = win.URL.createObjectURL(blob);
        opt_saveconfig_a.download = "ltbvis_config.json";

        opt_saveconfig_a.click();
    }

    const opt_loadsimulation_input = document.createElement("input");

    opt_loadsimulation_input.style.display = "none";
    opt_loadsimulation_input.type = "file";
    document.body.appendChild(opt_loadsimulation_input);

    opt_loadsimulation_input.onchange = function() {
        if (opt_loadsimulation_input.files.length > 0) {
            let fr = new FileReader();

            fr.onload = function(file) {
                win.load(file.target.result);
                win.startSimulation();
                win.endSimulation();
            }

            fr.readAsArrayBuffer(opt_loadsimulation_input.files[0]);
        }
    };

    opt_loadsimulation.onclick = function() {
        opt_loadsimulation_input.click();
    };

    const opt_savesimulation_a = document.createElement("a");

    opt_savesimulation_a.style.display = "none";
    document.body.appendChild(opt_savesimulation_a);

    opt_savesimulation.onclick = function() {
        let blob = new Blob([win.save()]);

        opt_savesimulation_a.href = window.URL.createObjectURL(blob);
        opt_savesimulation_a.download = "ltbvis_history.dimeb";

        opt_savesimulation_a.click();
    }

    updateInputs();
    SIDEBAR_CALLBACKS.push(updateInputs);

    return table_id;
}
