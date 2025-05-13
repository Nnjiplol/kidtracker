// script.js - Complete with Developer Tab, PathTracer V2 (Random Branching Path) & Fixes

document.addEventListener('DOMContentLoaded', () => {
    // --- Leaflet Map & Draw Setup ---
    const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const drawnItems = new L.FeatureGroup(); map.addLayer(drawnItems);
    let drawControl; let currentDrawingLayer = null; let incidentPlacementMarker = null;

    // --- Predefined & Custom Zones (Global) ---
    const predefinedZones = {
        home: { id: 'predef_home', name: "Home (Green Zone)", bounds: L.latLngBounds([51.500, -0.10], [51.503, -0.08]), color: '#2ECC71', type: 'Green' },
        park: { id: 'predef_park', name: "Park (Orange Zone)", bounds: L.latLngBounds([51.508, -0.10], [51.512, -0.07]), color: '#F39C12', type: 'Orange' },
        danger: { id: 'predef_danger', name: "Abandoned Lot (Red Zone)", bounds: L.latLngBounds([51.490, -0.05], [51.493, -0.03]), color: '#E74C3C', type: 'Red' },
        school: { id: 'predef_school', name: "School (Green Zone)", bounds: L.latLngBounds([51.515, -0.12], [51.518, -0.11]), color: '#2ECC71', type: 'Green' }
    };
    let customZones = [];

    // --- DOM Elements ---
    const childSelector = document.getElementById('child-selector');
    const btnAddChildSim = document.getElementById('btn-add-child-sim');
    const selectedChildNameTitle = document.getElementById('selected-child-name-title');
    const currentChildTabNameSpans = document.querySelectorAll('.current-child-tab-name');
    const statusPanelChildName = document.getElementById('status-panel-child-name');
    const childNameInput = document.getElementById('child-name-input');
    const btnUpdateProfile = document.getElementById('btn-update-profile');
    const childLocationEl = document.getElementById('child-location');
    const childDirectionEl = document.getElementById('child-direction');
    const currentZoneEl = document.getElementById('current-zone');
    const motionLevelEl = document.getElementById('motion-level');
    const childAltitudeEl = document.getElementById('child-altitude');
    const childBatteryEl = document.getElementById('child-battery');
    const batteryIconEl = document.getElementById('battery-icon');
    const appModeEl = document.getElementById('app-mode');
    const childLastStatusEl = document.getElementById('child-last-status');
    const childSafetyCheckStatusEl = document.getElementById('child-safety-check-status');
    const btnMoveHome = document.getElementById('btn-move-home');
    const btnMovePark = document.getElementById('btn-move-park');
    const btnMoveDanger = document.getElementById('btn-move-danger');
    const altitudeInput = document.getElementById('altitude-input');
    const btnSetAltitude = document.getElementById('btn-set-altitude');
    const motionSelect = document.getElementById('motion-select');
    const batterySlider = document.getElementById('battery-slider');
    const batteryValueDisplay = document.getElementById('battery-value');
    const childStatusMessageSelect = document.getElementById('child-status-message');
    const btnSendChildStatus = document.getElementById('btn-send-child-status');
    const btnSimUninstall = document.getElementById('btn-sim-uninstall');
    const btnSimForceShutdown = document.getElementById('btn-sim-force-shutdown');
    const btnRequestCheckin = document.getElementById('btn-request-checkin');
    const btnRingPhone = document.getElementById('btn-ring-phone');
    const btnToggleHistory = document.getElementById('btn-toggle-history');
    const btnChildSos = document.getElementById('btn-child-sos');
    const btnChildRespondOk = document.getElementById('btn-child-respond-ok');
    const btnChildRespondHelp = document.getElementById('btn-child-respond-help');
    const activeTimerDisplay = document.getElementById('active-timer-display');
    const safetyTimerDurationInput = document.getElementById('safety-timer-duration');
    const safetyTimerMessageInput = document.getElementById('safety-timer-message');
    const btnSetSafetyTimer = document.getElementById('btn-set-safety-timer');
    const btnCancelSafetyTimer = document.getElementById('btn-cancel-safety-timer');
    const newZoneNameInput = document.getElementById('new-zone-name');
    const newZoneTypeSelect = document.getElementById('new-zone-type');
    const btnStartDrawZone = document.getElementById('btn-start-draw-zone');
    const btnCancelDrawZone = document.getElementById('btn-cancel-draw-zone');
    const customZonesListEl = document.getElementById('custom-zones-list');
    const incidentTypeSelect = document.getElementById('incident-type');
    const incidentDescriptionInput = document.getElementById('incident-description');
    const incidentRadiusInput = document.getElementById('incident-radius');
    const incidentLocationInfo = document.getElementById('incident-location-info');
    const btnSimulateIncident = document.getElementById('btn-simulate-incident');
    const activeIncidentsListEl = document.getElementById('active-incidents-list');
    const lowBatteryThresholdInput = document.getElementById('low-battery-threshold');
    const altitudeDropThresholdInput = document.getElementById('altitude-drop-threshold');
    const chkModalForAlerts = document.getElementById('chk-modal-for-alerts');
    const chkEnableAmbientSound = document.getElementById('chk-enable-ambient-sound');
    const logOutputEl = document.getElementById('log-output');
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalOkButton = document.getElementById('modal-ok-button');
    const closeModalButton = document.querySelector('.close-button');

    // Developer Tab DOM Elements
    const devCompassHeadingEl = document.getElementById('dev-compass-heading');
    const devCompassAccuracyEl = document.getElementById('dev-compass-accuracy');
    const compassNeedleEl = document.getElementById('compass-needle');
    const devAccelXEl = document.getElementById('dev-accel-x');
    const devAccelYEl = document.getElementById('dev-accel-y');
    const devAccelZEl = document.getElementById('dev-accel-z');
    const devAccelMagEl = document.getElementById('dev-accel-mag');
    const gForceIndicatorEl = document.getElementById('g-force-indicator');
    const devPedometerStepsEl = document.getElementById('dev-pedometer-steps');
    const devPedometerLastTsEl = document.getElementById('dev-pedometer-lastts');
    const devGpsFixEl = document.getElementById('dev-gps-fix');
    const devNetworkTypeEl = document.getElementById('dev-network-type');
    const devWifiSsidEl = document.getElementById('dev-wifi-ssid');
    const micBars = document.querySelectorAll('#DeveloperTab .mic-bar');
    const devMicLevelDbEl = document.getElementById('dev-mic-level-db');

    // PathTracer V2 Tab DOM Elements
    const btnToggleGeolocation = document.getElementById('btn-toggle-geolocation');
    const pathTracerInfoEl = document.getElementById('path-tracer-info');
    const ptLastKnownCoordsEl = document.getElementById('pt-last-known-coords');
    const ptLastKnownTimeEl = document.getElementById('pt-last-known-time');
    const ptParamsDirectionEl = document.getElementById('pt-params-direction');
    const ptParamsHeadingDegEl = document.getElementById('pt-params-heading-deg');
    const ptParamsMotionEl = document.getElementById('pt-params-motion');
    const ptParamsSpeedEl = document.getElementById('pt-params-speed');
    const ptParamsAccelEl = document.getElementById('pt-params-accel');
    const ptPredictionDurationInput = document.getElementById('pt-prediction-duration');
    const btnPredictPath = document.getElementById('btn-predict-path');
    const ptStatusMessageEl = document.getElementById('pt-status-message');


    // --- App State ---
    let childStates = {}; let currentChildId = null; let nextChildSimId = 1;
    let activeIncidents = [];
    let globalSettings = { lowBatteryThreshold: 15, altitudeDropThreshold: -5, modalForAlerts: true, enableAmbientSound: true };
    let globalSimulationInterval; let drawingZoneMode = false; let showHistory = false;
    let locationHistoryPolyline = null;

    // --- Utility & Core Functions ---
    function getTimestamp() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
    function addLog(message, type = 'info', iconClass = 'fas fa-info-circle', childIdForName = null) {
        const childNamePrefix = childIdForName && childStates[childIdForName] ? `[${childStates[childIdForName].name}] ` : '';
        const logEntry = document.createElement('div'); logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<span class="timestamp">${getTimestamp()}</span> <i class="icon ${iconClass}"></i> ${childNamePrefix}${message}`;
        logOutputEl.prepend(logEntry); if (logOutputEl.children.length > 200) { logOutputEl.removeChild(logOutputEl.lastChild); }
    }
    function showModal(title, message, type = 'alert') {
        const isEmergency = type === 'emergency';
        if (!isEmergency && !globalSettings.modalForAlerts) { addLog(`Suppressed Modal: ${title}`, 'info', 'fas fa-comment-slash'); return; }
        modalTitle.textContent = title; modalMessage.innerHTML = message; modalTitle.className = type; modal.style.display = 'flex'; 
    }
    closeModalButton.onclick = () => modal.style.display = "none"; modalOkButton.onclick = () => modal.style.display = "none";
    window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };
    window.openTab = function(evt, tabName) {
        document.querySelectorAll(".tab-content").forEach(tc => { tc.style.display = "none"; tc.classList.remove("active-tab"); });
        document.querySelectorAll(".tab-link").forEach(tl => tl.classList.remove("active"));
        const tabToOpen = document.getElementById(tabName);
        if(tabToOpen) { 
            tabToOpen.style.display = "block"; tabToOpen.classList.add("active-tab");
        }
        if(evt && evt.currentTarget) evt.currentTarget.classList.add("active");
        
        if (tabName === 'DeveloperTab' && currentChildId) updateDeveloperTabUI(currentChildId);
        if (tabName === 'PathTracerV2Tab' && currentChildId) updatePathTracerTabUI(currentChildId);
    };

    // --- Child Management ---
    const childMarkerColors = ['#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#34495E', '#E67E22'];
    let colorIndex = 0;
    function getChildColor() { const color = childMarkerColors[colorIndex % childMarkerColors.length]; colorIndex++; return color; }
    function getContrastYIQ(hexcolor){ hexcolor = hexcolor.replace("#", ""); var r = parseInt(hexcolor.substr(0,2),16); var g = parseInt(hexcolor.substr(2,2),16); var b = parseInt(hexcolor.substr(4,2),16); var yiq = ((r*299)+(g*587)+(b*114))/1000; return (yiq >= 128) ? 'black' : 'white'; }
    function createChildMarkerIcon(initial, color, isSelected, isGeoDisabled = false) {
        let extraClass = isSelected ? 'selected-child-marker' : '';
        if (isGeoDisabled) extraClass += ' geo-disabled-marker';
        const iconHtml = `<div class="child-marker-divicon ${extraClass}" style="background-color: ${color};">
                            <span class="child-marker-initial" style="color: ${getContrastYIQ(color)};">${initial}</span></div>`;
        return L.divIcon({ html: iconHtml, className: '', iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -13] });
    }
    function createNewChildState(name) {
        const childId = `sim_child_${nextChildSimId++}`;
        const initialLat = 51.505 + (Math.random() - 0.5) * 0.025; const initialLng = -0.09 + (Math.random() - 0.5) * 0.025;
        const color = getChildColor();
        childStates[childId] = {
            id: childId, name: name, color: color, lat: initialLat, lng: initialLng, prevLat: null, prevLng: null, altitude: 0, motion: 'Stationary', battery: 100,
            currentZoneId: null, currentZoneType: 'Undefined', appMode: 'Normal', direction: 'N/A', lastStatusMessage: 'N/A',
            locationHistory: [[initialLat, initialLng]], MAX_HISTORY_POINTS: 20,
            marker: L.marker([initialLat, initialLng], { icon: createChildMarkerIcon(name.substring(0,1).toUpperCase(), color, false) }).addTo(map).bindPopup(`<b>${name}</b>`),
            safetyCheckTimer: { active: false, dueTime: null, message: '', notified: false }, lastSafeActivityTime: Date.now(), nearIncident: null,
            devData: { compassHeading: 0, compassAccuracy: "High", accelX: 0, accelY: 0, accelZ: 9.81, pedometerSteps: 0, lastStepTime: null, gpsFixType: "Satellite", gpsSatellites: 12, networkType: "LTE", networkStrength: 4, wifiSSID: "Not Connected", micLevel: 0.1 },
            geolocationDisabled: false, 
            lastKnownGeolocation: null, 
            pathTracePolyline: null // Can be a single polyline or an array of polylines
        };
        addLog(`New child "${name}" added.`, 'success', 'fas fa-user-plus'); return childId;
    }
    function updateChildSelectorUI() {
        const previousSelection = childSelector.value; childSelector.innerHTML = '';
        Object.values(childStates).forEach(child => { const option = document.createElement('option'); option.value = child.id; option.textContent = child.name; childSelector.appendChild(option); });
        if (childStates[previousSelection]) childSelector.value = previousSelection; else if (Object.keys(childStates).length > 0) childSelector.value = Object.keys(childStates)[0];
        handleChildSelectionChange();
    }
    function handleChildSelectionChange() {
        const newChildId = childSelector.value;

        // Clear previous child's path trace(s) from map if any
        if (currentChildId && childStates[currentChildId] && childStates[currentChildId].pathTracePolyline) {
            if (Array.isArray(childStates[currentChildId].pathTracePolyline)) {
                childStates[currentChildId].pathTracePolyline.forEach(pl => map.removeLayer(pl));
            } else {
                map.removeLayer(childStates[currentChildId].pathTracePolyline);
            }
        }

        if (!newChildId || !childStates[newChildId]) { 
            currentChildId = null; 
            updateStatusPanelForChild(null); 
            updateControlsForChild(null); 
            updateSafetyTimerDisplay(null); 
            updatePathTracerTabUI(null); 
            if(locationHistoryPolyline) map.removeLayer(locationHistoryPolyline); 
            locationHistoryPolyline = null; 
            return; 
        }
        
        currentChildId = newChildId; const child = childStates[currentChildId];
        childNameInput.value = child.name; selectedChildNameTitle.textContent = child.name; statusPanelChildName.textContent = child.name;
        currentChildTabNameSpans.forEach(span => span.textContent = child.name);
        
        Object.values(childStates).forEach(c => { 
            c.marker.setIcon(createChildMarkerIcon(c.name.substring(0,1).toUpperCase(), c.color, c.id === currentChildId, c.geolocationDisabled)); 
            c.marker.setZIndexOffset(c.id === currentChildId ? 1000 : 0); 
        });
        
        updateStatusPanelForChild(currentChildId); 
        updateControlsForChild(currentChildId); 
        updateSafetyTimerDisplay(currentChildId); 
        updateDeveloperTabUI(currentChildId);
        updatePathTracerTabUI(currentChildId); 

        if (showHistory) { if(locationHistoryPolyline) map.removeLayer(locationHistoryPolyline); locationHistoryPolyline = null; drawLocationHistory(currentChildId); } 
        else { if(locationHistoryPolyline) map.removeLayer(locationHistoryPolyline); locationHistoryPolyline = null; }
        
        // Re-add current child's path trace(s) to map if it exists
        if (child.pathTracePolyline) {
            if (Array.isArray(child.pathTracePolyline)) {
                child.pathTracePolyline.forEach(pl => pl.addTo(map));
            } else {
                child.pathTracePolyline.addTo(map);
            }
        }
    }
    function updateControlsForChild(childId) { if (!childId || !childStates[childId]) { altitudeInput.value = 0; motionSelect.value = "Stationary"; batterySlider.value = 100; batteryValueDisplay.textContent = `100%`; return; } const child = childStates[childId]; altitudeInput.value = child.altitude; motionSelect.value = child.motion; batterySlider.value = child.battery; batteryValueDisplay.textContent = `${child.battery}%`; }
    function updateStatusPanelForChild(childId) { 
        if (!childId || !childStates[childId]) { 
            childLocationEl.textContent = "N/A"; childDirectionEl.textContent = "N/A"; motionLevelEl.textContent = "N/A"; childAltitudeEl.textContent = "N/A"; currentZoneEl.textContent = "Undefined"; currentZoneEl.className = "zone-undefined"; childBatteryEl.textContent = "N/A"; batteryIconEl.className = "fas fa-battery-empty"; appModeEl.textContent = "N/A"; childLastStatusEl.textContent = "N/A"; childSafetyCheckStatusEl.textContent = "N/A"; return; 
        } 
        const child = childStates[childId]; 
        const zoneInfo = child.geolocationDisabled ? null : getCurrentZoneInfo(child.lat, child.lng); 
        const zoneDisplayName = zoneInfo ? zoneInfo.name : (child.geolocationDisabled ? 'Unknown (Geo Off)' : 'Undefined'); 
        const currentZoneTypeDisplay = zoneInfo ? zoneInfo.type : (child.geolocationDisabled ? 'Unknown' : 'Undefined'); 
        
        if (child.geolocationDisabled && child.lastKnownGeolocation) {
            childLocationEl.innerHTML = `<i class="fas fa-map-marker-slash"></i> Geo Disabled (Last: ${child.lastKnownGeolocation.lat.toFixed(4)}, ${child.lastKnownGeolocation.lng.toFixed(4)})`;
        } else {
            childLocationEl.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${child.lat.toFixed(4)}, ${child.lng.toFixed(4)} (${getSimulatedAddress(child.lat, child.lng)})`;
        }
        
        childDirectionEl.innerHTML = `<i class="fas fa-compass"></i> ${child.geolocationDisabled ? 'N/A (Geo Off)' : child.direction}`; 
        currentZoneEl.textContent = `${zoneDisplayName} (${currentZoneTypeDisplay})`; 
        currentZoneEl.className = `zone-${currentZoneTypeDisplay.toLowerCase()}`; 
        motionLevelEl.innerHTML = `<i class="fas ${getMotionIcon(child.motion)}"></i> ${child.motion}`; 
        childAltitudeEl.innerHTML = `<i class="fas fa-mountain"></i> ${child.altitude}`; 
        childBatteryEl.textContent = `${child.battery}%`; 
        updateBatteryIcon(child.battery); 
        appModeEl.innerHTML = `<i class="fas ${getAppModeIcon(child.appMode)}"></i> ${child.appMode}`; 
        childLastStatusEl.textContent = child.lastStatusMessage; 
        childSafetyCheckStatusEl.textContent = getSafetyCheckStatusString(child); 
        
        let popupContent = `<b>${child.name}</b>`;
        if (child.geolocationDisabled && child.lastKnownGeolocation) {
            popupContent += `<br>Last known: ${getSimulatedAddress(child.lastKnownGeolocation.lat, child.lastKnownGeolocation.lng)}`;
            popupContent += `<br>(Geolocation Disabled)`;
        } else {
            popupContent += `<br>${getSimulatedAddress(child.lat, child.lng)}`;
            popupContent += `<br>Zone: ${zoneDisplayName} (${currentZoneTypeDisplay})`;
        }
        popupContent += `<br>Batt: ${child.battery}%`;
        child.marker.setPopupContent(popupContent); 
    }
    function getMotionIcon(motion) { switch(motion) { case 'Stationary': return 'fa-street-view'; case 'Walking': return 'fa-walking'; case 'Running': return 'fa-running'; case 'In Vehicle': return 'fa-car'; default: return 'fa-question-circle'; } }
    function getAppModeIcon(mode) { switch(mode) { case 'Battery Saver': return 'fa-leaf'; case 'High Vigilance': return 'fa-eye'; case 'EMERGENCY': return 'fa-exclamation-triangle'; default: return 'fa-cog'; } }
    function updateBatteryIcon(batteryLevel) { batteryIconEl.className = 'fas'; if (batteryLevel <= 10) batteryIconEl.classList.add('fa-battery-empty', 'danger'); else if (batteryLevel <= 25) batteryIconEl.classList.add('fa-battery-quarter', 'warning'); else if (batteryLevel <= 50) batteryIconEl.classList.add('fa-battery-half', 'ok'); else if (batteryLevel <= 85) batteryIconEl.classList.add('fa-battery-three-quarters', 'good'); else batteryIconEl.classList.add('fa-battery-full', 'good'); }
    function getSimulatedAddress(lat, lng) { const zoneInfo = getCurrentZoneInfo(lat, lng); if (zoneInfo) return zoneInfo.name; return "Open Area"; }
    function calculateDirection(prevLat, prevLng, currentLat, currentLng) { if (prevLat === null || prevLng === null || (prevLat === currentLat && prevLng === currentLng)) return 'N/A'; const latDiff = currentLat - prevLat; const lngDiff = currentLng - prevLng; if (Math.abs(latDiff) < 0.00001 && Math.abs(lngDiff) < 0.00001) return (currentChildId && childStates[currentChildId]) ? childStates[currentChildId].direction : 'N/A'; const angle = Math.atan2(lngDiff, latDiff) * 180 / Math.PI; if (angle >= -22.5 && angle < 22.5) return 'North'; if (angle >= 22.5 && angle < 67.5) return 'North East'; if (angle >= 67.5 && angle < 112.5) return 'East'; if (angle >= 112.5 && angle < 157.5) return 'South East'; if (angle >= 157.5 || angle < -157.5) return 'South'; if (angle >= -157.5 && angle < -112.5) return 'South West'; if (angle >= -112.5 && angle < -67.5) return 'West'; if (angle >= -67.5 && angle < -22.5) return 'North West'; return 'N/A'; }
    
    // --- Location History ---
    function recordLocationHistory(childId) { if (!childId || !childStates[childId] || childStates[childId].geolocationDisabled) return; const child = childStates[childId]; child.locationHistory.push([child.lat, child.lng]); if (child.locationHistory.length > child.MAX_HISTORY_POINTS) { child.locationHistory.shift(); } if (showHistory && childId === currentChildId) drawLocationHistory(childId); }
    function drawLocationHistory(childId) { if (locationHistoryPolyline) map.removeLayer(locationHistoryPolyline); locationHistoryPolyline = null; if (!childId || !childStates[childId]) return; const child = childStates[childId]; if (child.locationHistory.length > 1) { locationHistoryPolyline = L.polyline(child.locationHistory, { color: child.color || 'blue', weight: 3, opacity: 0.7 }).addTo(map); } }
    function toggleLocationHistoryUI() { showHistory = !showHistory; if (showHistory) { if (currentChildId) drawLocationHistory(currentChildId); addLog(`Location history enabled.`, 'info', 'fas fa-history', currentChildId); btnToggleHistory.innerHTML = '<i class="fas fa-history"></i> Hide History'; } else { if (locationHistoryPolyline) map.removeLayer(locationHistoryPolyline); locationHistoryPolyline = null; addLog(`Location history disabled.`, 'info', 'fas fa-history', currentChildId); btnToggleHistory.innerHTML = '<i class="fas fa-history"></i> Show History'; } }

    // --- Zone Management ---
    function initializeDrawControl() { drawControl = new L.Control.Draw({ edit: { featureGroup: drawnItems, remove: false, edit: false }, draw: { polygon: false, polyline: false, circle: false, circlemarker: false, marker: false, rectangle: { shapeOptions: { color: '#007bff', weight: 2, opacity: 0.7, fillOpacity: 0.25 } } } }); }
    function startDrawingZone() { if (drawingZoneMode) return; if (!drawControl || !drawControl.options.draw.rectangle) { console.error("Draw tool error."); addLog("Error: Drawing tool not ready.", "emergency"); return; } drawingZoneMode = true; btnStartDrawZone.innerHTML = '<i class="fas fa-pencil-ruler"></i> Drawing...'; btnStartDrawZone.classList.add('drawing'); btnCancelDrawZone.style.display = 'inline-block'; new L.Draw.Rectangle(map, drawControl.options.draw.rectangle).enable(); }
    function cancelDrawingZone() { if (!drawingZoneMode) return; if (map.editTools && map.editTools.drawing()) map.editTools.stopDrawing(); drawingZoneMode = false; btnStartDrawZone.innerHTML = '<i class="fas fa-pencil-ruler"></i> Draw New Zone'; btnStartDrawZone.classList.remove('drawing'); btnCancelDrawZone.style.display = 'none'; if (currentDrawingLayer) { map.removeLayer(currentDrawingLayer); currentDrawingLayer = null; } addLog("Zone drawing cancelled.", 'info', 'fas fa-ban'); }
    map.on(L.Draw.Event.DRAWSTART, function(event) { if(drawingZoneMode) currentDrawingLayer = event.layer; });
    map.on(L.Draw.Event.CREATED, function (event) { if (!drawingZoneMode) return; const layer = event.layer; const zoneName = newZoneNameInput.value.trim() || `Custom Zone ${customZones.length + 1}`; const zoneType = newZoneTypeSelect.value; const zoneId = `cz_${Date.now()}`; const zoneColor = getZoneColor(zoneType); const newZone = { id: zoneId, name: zoneName, type: zoneType, color: zoneColor, bounds: layer.getBounds(), layer: L.rectangle(layer.getBounds(), { color: zoneColor, weight: 1, fillOpacity: 0.25 }).addTo(map).bindPopup(`<b>${zoneName}</b> (${zoneType})`) }; customZones.push(newZone); addLog(`Custom zone "${zoneName}" (${zoneType}) created.`, 'success', 'fas fa-plus-circle'); renderCustomZonesList(); newZoneNameInput.value = ''; currentDrawingLayer = null; drawingZoneMode = false; btnStartDrawZone.innerHTML = '<i class="fas fa-pencil-ruler"></i> Draw New Zone'; btnStartDrawZone.classList.remove('drawing'); btnCancelDrawZone.style.display = 'none'; });
    function getZoneColor(zoneType) { if (zoneType === 'Green') return '#2ECC71'; if (zoneType === 'Orange') return '#F39C12'; if (zoneType === 'Red') return '#E74C3C'; return '#777777'; }
    function renderCustomZonesList() { customZonesListEl.innerHTML = ''; if (customZones.length === 0) { customZonesListEl.innerHTML = '<li class="no-zones">No custom zones.</li>'; return; } customZones.forEach(zone => { const li = document.createElement('li'); li.innerHTML = `<span class="zone-name">${zone.name}</span><span class="zone-type-badge" style="background-color:${zone.color}; color:${getContrastYIQ(zone.color)};">${zone.type}</span><button class="delete-zone-btn" data-zoneid="${zone.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>`; li.querySelector('.delete-zone-btn').addEventListener('click', () => deleteCustomZone(zone.id)); customZonesListEl.appendChild(li); }); }
    function deleteCustomZone(zoneId) { const zoneIndex = customZones.findIndex(z => z.id === zoneId); if (zoneIndex > -1) { const ztd = customZones[zoneIndex]; if(ztd.layer) map.removeLayer(ztd.layer); customZones.splice(zoneIndex, 1); addLog(`Custom zone "${ztd.name}" deleted.`, 'info', 'fas fa-trash-alt'); renderCustomZonesList(); if (currentChildId) checkCurrentZone(currentChildId); } }

    // --- Safety Check Timer ---
    function setSafetyCheckTimer(childId) { if (!childId || !childStates[childId]) return; const child = childStates[childId]; const durationMinutes = parseInt(safetyTimerDurationInput.value); const message = safetyTimerMessageInput.value.trim() || `Time to check in, ${child.name}!`; if (isNaN(durationMinutes) || durationMinutes <= 0) { addLog("Invalid timer duration.", 'alert', 'fas fa-times-circle', childId); return; } child.safetyCheckTimer.active = true; child.safetyCheckTimer.dueTime = Date.now() + durationMinutes * 60 * 1000; child.safetyCheckTimer.message = message; child.safetyCheckTimer.notified = false; addLog(`Safety check timer set. Due in ${durationMinutes} min.`, 'action', 'fas fa-stopwatch', childId); updateSafetyTimerDisplay(childId); updateStatusPanelForChild(childId); }
    function cancelSafetyCheckTimer(childId) { if (!childId || !childStates[childId] || !childStates[childId].safetyCheckTimer.active) return; const child = childStates[childId]; child.safetyCheckTimer.active = false; child.safetyCheckTimer.dueTime = null; child.safetyCheckTimer.notified = false; addLog(`Safety check timer cancelled.`, 'info', 'fas fa-ban', childId); updateSafetyTimerDisplay(childId); updateStatusPanelForChild(childId); }
    function updateSafetyTimerDisplay(childId) { if (!childId || !childStates[childId]) { activeTimerDisplay.textContent = "Select child."; btnCancelSafetyTimer.style.display = 'none'; return; } const child = childStates[childId]; if (child.safetyCheckTimer.active && child.safetyCheckTimer.dueTime) { const timeLeftMs = child.safetyCheckTimer.dueTime - Date.now(); if (timeLeftMs > 0) { const minutes = Math.floor(timeLeftMs / 60000); const seconds = Math.floor((timeLeftMs % 60000) / 1000); activeTimerDisplay.textContent = `Active. Due in: ${minutes}m ${seconds}s.`; btnCancelSafetyTimer.style.display = 'inline-block'; } else { activeTimerDisplay.textContent = `Overdue!`; btnCancelSafetyTimer.style.display = 'inline-block'; } } else { activeTimerDisplay.textContent = `No active timer for ${child.name}.`; btnCancelSafetyTimer.style.display = 'none'; } }
    function getSafetyCheckStatusString(child) { if (!child.safetyCheckTimer.active) return "N/A"; if (child.safetyCheckTimer.dueTime) { const timeLeftMs = child.safetyCheckTimer.dueTime - Date.now(); if (timeLeftMs > 0) return `Due in ${Math.ceil(timeLeftMs / 60000)} min`; return "Overdue"; } return "Pending"; }
    function checkSafetyTimers() { Object.values(childStates).forEach(child => { if (child.safetyCheckTimer.active && !child.safetyCheckTimer.notified && child.safetyCheckTimer.dueTime && Date.now() > child.safetyCheckTimer.dueTime) { const timeSinceSafeActivity = Date.now() - child.lastSafeActivityTime; const safeWindowBeforeDue = 30 * 60 * 1000; if (child.safetyCheckTimer.dueTime - child.lastSafeActivityTime > safeWindowBeforeDue) { addLog(`SAFETY CHECK MISSED: "${child.safetyCheckTimer.message}"`, 'emergency', 'fas fa-user-clock', child.id); showModal("Safety Check Missed!", `<b>${child.name}</b> missed safety check-in by ${new Date(child.safetyCheckTimer.dueTime).toLocaleTimeString()}.<br>Reminder: "${child.safetyCheckTimer.message}"`, 'emergency'); child.safetyCheckTimer.notified = true; if (child.appMode !== 'EMERGENCY') child.appMode = 'High Vigilance'; if (child.id === currentChildId) updateStatusPanelForChild(child.id); } else { addLog(`Safety check due, recent safe activity. Timer cleared.`, 'info', 'fas fa-check-circle', child.id); child.safetyCheckTimer.active = false; child.safetyCheckTimer.notified = true; if (child.id === currentChildId) { updateSafetyTimerDisplay(child.id); updateStatusPanelForChild(child.id); } } } if (child.safetyCheckTimer.active && child.id === currentChildId) updateSafetyTimerDisplay(child.id); }); }

    // --- Nearby Incident Alerts ---
    let tempIncidentLatLng = null;
    function simulateNewIncident() { const type = incidentTypeSelect.value; const description = incidentDescriptionInput.value.trim() || `Simulated ${type}`; const radius = parseInt(incidentRadiusInput.value); if (isNaN(radius) || radius <= 0) { addLog("Invalid incident radius.", 'alert', 'fas fa-times-circle'); return; } if (!tempIncidentLatLng) { addLog("Click map to set incident location.", 'alert', 'fas fa-map-pin'); return; } const incidentId = `inc_${Date.now()}`; const incidentColor = type === 'AmberAlert' ? '#ffc107' : (type === 'CriminalActivity' ? '#dc3545' : '#17a2b8'); const incident = { id: incidentId, type: type, lat: tempIncidentLatLng.lat, lng: tempIncidentLatLng.lng, radius: radius, description: description, layer: L.circle([tempIncidentLatLng.lat, tempIncidentLatLng.lng], { radius: radius, color: incidentColor, weight:2, className: 'incident-area-circle',fillOpacity: 0.1 }).addTo(map).bindPopup(`<b>${type}</b><br>${description}<br>R: ${radius}m`) }; activeIncidents.push(incident); addLog(`New incident: ${type} - "${description}".`, 'alert', 'fas fa-bullhorn'); renderActiveIncidentsList(); checkAllChildrenForIncidentProximity(); if (incidentPlacementMarker) { map.removeLayer(incidentPlacementMarker); incidentPlacementMarker = null; } tempIncidentLatLng = null; incidentLocationInfo.textContent = "Click on map to set incident location."; incidentDescriptionInput.value = ""; }
    function renderActiveIncidentsList() { activeIncidentsListEl.innerHTML = ''; if (activeIncidents.length === 0) { activeIncidentsListEl.innerHTML = '<li class="no-incidents">No active incidents.</li>'; return; } activeIncidents.forEach(inc => { const li = document.createElement('li'); const badgeClass = `incident-${inc.type.toLowerCase()}-bg`; li.innerHTML = `<span class="incident-type-badge ${badgeClass}">${inc.type}</span><span class="incident-desc">${inc.description} (R: ${inc.radius}m)</span><button class="delete-incident-btn" data-id="${inc.id}" title="Clear"><i class="fas fa-times-circle"></i></button>`; li.querySelector('.delete-incident-btn').addEventListener('click', () => clearIncident(inc.id)); activeIncidentsListEl.appendChild(li); }); }
    function clearIncident(incidentId) { const index = activeIncidents.findIndex(inc => inc.id === incidentId); if (index > -1) { if(activeIncidents[index].layer) map.removeLayer(activeIncidents[index].layer); activeIncidents.splice(index, 1); addLog(`Incident ${incidentId} cleared.`, 'info', 'fas fa-check-circle'); renderActiveIncidentsList(); Object.values(childStates).forEach(child => { if(child.nearIncident === incidentId) child.nearIncident = null; }); } }
    function checkAllChildrenForIncidentProximity() { activeIncidents.forEach(incident => { Object.values(childStates).forEach(child => { if (child.geolocationDisabled) return; const dist = L.latLng(child.lat, child.lng).distanceTo(L.latLng(incident.lat, incident.lng)); if (dist <= incident.radius) { if (child.nearIncident !== incident.id) { addLog(`${child.name} NEAR active ${incident.type}! Desc: "${incident.description}".`, 'emergency', 'fas fa-exclamation-triangle', child.id); showModal("NEARBY INCIDENT!", `<b>${child.name}</b> near <b>${incident.type}</b>!<br>"${incident.description}"<br>~${dist.toFixed(0)}m away. CAUTION!`, 'emergency'); child.nearIncident = incident.id; if (child.appMode !== 'EMERGENCY') child.appMode = 'High Vigilance'; if (child.id === currentChildId) updateStatusPanelForChild(child.id); } } else { if (child.nearIncident === incident.id) { child.nearIncident = null; addLog(`${child.name} no longer near incident ${incident.type}.`, 'success', 'fas fa-shield-alt', child.id); if (child.id === currentChildId) updateStatusPanelForChild(child.id); } } }); }); }

    // --- Tamper Detection ---
    function simulateUninstallAttempt(childId) { if (!childId || !childStates[childId]) return; const child = childStates[childId]; addLog(`TAMPER: Uninstall on ${child.name}'s device! SIM: SOS.`, 'emergency', 'fas fa-user-secret', childId); simulateEmergencyCall(childId, `Uninstall Attempt`, `KidSafeNet uninstall attempt on device.`); }
    function simulateForceShutdown(childId) { if (!childId || !childStates[childId]) return; const child = childStates[childId]; addLog(`TAMPER: Force shutdown on ${child.name}'s device! SIM: Final ping.`, 'emergency', 'fas fa-power-off', childId); simulateEmergencyCall(childId, `Force Shutdown`, `Forceful phone shutdown on device.`); child.battery = 0; child.appMode = 'EMERGENCY'; if (child.id === currentChildId) updateStatusPanelForChild(childId); }

    // --- Developer Tab UI Update ---
    function updateDeveloperTabUI(childId) {
        if (!childId || !childStates[childId] || !document.getElementById('DeveloperTab').classList.contains('active-tab')) {
            return;
        }
        const child = childStates[childId]; const dev = child.devData;
        devCompassHeadingEl.textContent = dev.compassHeading.toFixed(0);
        devCompassAccuracyEl.textContent = dev.compassAccuracy;
        if (compassNeedleEl) compassNeedleEl.style.transform = `rotate(${dev.compassHeading}deg)`;
        devAccelXEl.textContent = dev.accelX.toFixed(2); devAccelYEl.textContent = dev.accelY.toFixed(2); devAccelZEl.textContent = dev.accelZ.toFixed(2);
        const mag = Math.sqrt(dev.accelX**2 + dev.accelY**2 + dev.accelZ**2); devAccelMagEl.textContent = mag.toFixed(2);
        const gForcePercent = Math.min(100, (mag / (9.81 * 3)) * 100); if (gForceIndicatorEl) gForceIndicatorEl.style.width = `${gForcePercent}%`;
        devPedometerStepsEl.textContent = dev.pedometerSteps; devPedometerLastTsEl.textContent = dev.lastStepTime ? new Date(dev.lastStepTime).toLocaleTimeString() : "N/A";
        devGpsFixEl.textContent = `${dev.gpsFixType} (${dev.gpsSatellites} sats)`; devNetworkTypeEl.textContent = `${dev.networkType} (${dev.networkStrength} bars)`; devWifiSsidEl.textContent = dev.wifiSSID;
        micBars.forEach((bar, index) => { const heightFactor = (Math.sin(index + Date.now() / 200) + 1) / 2; bar.style.height = `${Math.min(100, dev.micLevel * 70 + heightFactor * dev.micLevel * 30)}%`; });
        let micDbText = "Very Quiet (-70 dB)"; if (dev.micLevel > 0.7) micDbText = "Loud (-10 dB)"; else if (dev.micLevel > 0.4) micDbText = "Moderate (-30 dB)"; else if (dev.micLevel > 0.1) micDbText = "Quiet (-50 dB)";
        devMicLevelDbEl.textContent = micDbText;
    }

    // --- PathTracer V2 Logic ---
    function getSpeedFromMotion(motion) {
        switch(motion) {
            case 'Stationary': return 0;
            case 'Walking': return 1.4; // m/s
            case 'Running': return 3.0; // m/s
            case 'In Vehicle': return 15.0; // m/s (~54 km/h)
            default: return 0;
        }
    }

    function updatePathTracerTabUI(childId) {
        if (!childId || !childStates[childId]) {
            pathTracerInfoEl.style.display = 'none';
            ptStatusMessageEl.textContent = 'Select a child to use PathTracer.';
            ptStatusMessageEl.style.display = 'block';
            if(btnToggleGeolocation) btnToggleGeolocation.innerHTML = '<i class="fas fa-map-marker-slash"></i> Simulate Disable Geolocation';
            return;
        }
        const child = childStates[childId];
        if (child.geolocationDisabled && child.lastKnownGeolocation) {
            pathTracerInfoEl.style.display = 'block';
            ptStatusMessageEl.style.display = 'none';
            ptLastKnownCoordsEl.textContent = `${child.lastKnownGeolocation.lat.toFixed(5)}, ${child.lastKnownGeolocation.lng.toFixed(5)}`;
            ptLastKnownTimeEl.textContent = new Date(child.lastKnownGeolocation.timestamp).toLocaleTimeString();
            ptParamsDirectionEl.textContent = child.lastKnownGeolocation.directionString || 'N/A';
            ptParamsHeadingDegEl.textContent = child.lastKnownGeolocation.headingDegrees !== undefined ? child.lastKnownGeolocation.headingDegrees.toFixed(0) : 'N/A';
            ptParamsMotionEl.textContent = child.lastKnownGeolocation.motion || 'N/A';
            ptParamsSpeedEl.textContent = getSpeedFromMotion(child.lastKnownGeolocation.motion).toFixed(1); // Display potential speed
            ptParamsAccelEl.textContent = child.lastKnownGeolocation.accelMag !== undefined ? child.lastKnownGeolocation.accelMag.toFixed(2) : 'N/A';
            if(btnToggleGeolocation) btnToggleGeolocation.innerHTML = '<i class="fas fa-map-marker-check"></i> Simulate Enable Geolocation';
        } else {
            pathTracerInfoEl.style.display = 'none';
            ptStatusMessageEl.textContent = 'Enable "Disable Geolocation" to use PathTracer for this child.';
            ptStatusMessageEl.style.display = 'block';
            if(btnToggleGeolocation) btnToggleGeolocation.innerHTML = '<i class="fas fa-map-marker-slash"></i> Simulate Disable Geolocation';
        }
    }

    function toggleGeolocationStatus() {
        if (!currentChildId || !childStates[currentChildId]) return;
        const child = childStates[currentChildId];
        child.geolocationDisabled = !child.geolocationDisabled;

        if (child.geolocationDisabled) {
            const accelMag = Math.sqrt(child.devData.accelX**2 + child.devData.accelY**2 + child.devData.accelZ**2);
            child.lastKnownGeolocation = {
                lat: child.lat,
                lng: child.lng,
                timestamp: Date.now(),
                directionString: child.direction,
                headingDegrees: child.devData.compassHeading,
                motion: child.motion,
                accelMag: isNaN(accelMag) ? 0 : accelMag
            };
            addLog(`Geolocation disabled for ${child.name}. PathTracer active.`, 'alert', 'fas fa-map-marker-slash', child.id);
            child.marker.setIcon(createChildMarkerIcon(child.name.substring(0,1).toUpperCase(), child.color, true, true)); 
        } else {
            addLog(`Geolocation enabled for ${child.name}. PathTracer inactive.`, 'success', 'fas fa-map-marker-alt', child.id);
            child.lastKnownGeolocation = null;
            if (child.pathTracePolyline) {
                if (Array.isArray(child.pathTracePolyline)) {
                    child.pathTracePolyline.forEach(pl => map.removeLayer(pl));
                } else {
                    map.removeLayer(child.pathTracePolyline);
                }
                child.pathTracePolyline = null;
            }
            child.marker.setIcon(createChildMarkerIcon(child.name.substring(0,1).toUpperCase(), child.color, true, false)); 
        }
        updatePathTracerTabUI(currentChildId);
        updateStatusPanelForChild(currentChildId); 
    }
    
    function calculateNewLatLng(lat, lng, bearing, distance) { 
        const R = 6371e3; 
        const lat1 = lat * Math.PI / 180;
        const lon1 = lng * Math.PI / 180;
        const bearingRad = bearing * Math.PI / 180;

        const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) +
                         Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearingRad));
        const lon2 = lon1 + Math.atan2(Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1),
                                 Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));
        return [lat2 * 180 / Math.PI, lon2 * 180 / Math.PI];
    }

    const directionToAngleMap = { 'North': 0, 'North East': 45, 'East': 90, 'South East': 135, 'South': 180, 'South West': 225, 'West': 270, 'North West': 315 };

    function predictAndDrawPath() {
        if (!currentChildId || !childStates[currentChildId] || !childStates[currentChildId].geolocationDisabled || !childStates[currentChildId].lastKnownGeolocation) {
            addLog("Cannot predict path: Geolocation not disabled or no last known data.", 'alert', 'fas fa-exclamation-triangle', currentChildId);
            console.error("PathTracer V2: Path prediction pre-check failed:", { currentChildId, childState: childStates[currentChildId] });
            return;
        }
        const child = childStates[currentChildId];
        const lastGeo = child.lastKnownGeolocation;
        console.log("PathTracer V2: Generating random cool path for:", child.name, "Last Geo:", JSON.parse(JSON.stringify(lastGeo)));

        // Clear previous path trace(s)
        if (child.pathTracePolyline) { 
            if (Array.isArray(child.pathTracePolyline)) { 
                child.pathTracePolyline.forEach(pl => map.removeLayer(pl));
            } else { 
                map.removeLayer(child.pathTracePolyline);
            }
            child.pathTracePolyline = null;
            console.log("PathTracer V2: Removed previous path trace(s).");
        }

        const durationMinutes = parseInt(ptPredictionDurationInput.value);
        if (isNaN(durationMinutes) || durationMinutes <= 0) {
            addLog("Invalid prediction duration.", 'alert', 'fas fa-times-circle', currentChildId);
            console.error("PathTracer V2: Invalid prediction duration:", durationMinutes);
            return;
        }

        let initialBearing = lastGeo.headingDegrees;
        if (isNaN(parseFloat(initialBearing)) || initialBearing === null || initialBearing === undefined) {
            initialBearing = directionToAngleMap[lastGeo.directionString];
        }
        if (isNaN(parseFloat(initialBearing)) || initialBearing === null || initialBearing === undefined) {
             initialBearing = Math.random() * 360; 
             console.warn(`PathTracer V2: Bearing defaulted to random ${initialBearing.toFixed(0)} deg.`);
        }

        const totalSegments = Math.max(5, Math.floor(durationMinutes / 2)); 
        const segmentLengthBase = 50; 
        const mainPathTurnAngleMax = 45; 
        const branchProbability = 0.3; 
        const branchSegments = 3;      
        const branchTurnAngleMax = 60; 
        const branchLengthMultiplier = 0.7; 

        let currentLat = lastGeo.lat;
        let currentLng = lastGeo.lng;
        let currentBearing = initialBearing;
        
        const allPolylines = []; 

        function createPath(startLat, startLng, startBearing, numSegments, segmentLength, turnAngleMax, isBranch = false) {
            const points = [[startLat, startLng]];
            let segLat = startLat;
            let segLng = startLng;
            let segBearing = startBearing;

            for (let i = 0; i < numSegments; i++) {
                const actualSegmentLength = segmentLength * (0.8 + Math.random() * 0.4);
                segBearing = (segBearing + (Math.random() - 0.5) * 2 * turnAngleMax + 360) % 360;
                
                const newCoords = calculateNewLatLng(segLat, segLng, segBearing, actualSegmentLength);
                if (isNaN(newCoords[0]) || isNaN(newCoords[1])) {
                    console.error(`PathTracer V2: NaN coordinates in ${isBranch ? 'branch' : 'main path'}. Skipping segment.`);
                    break;
                }
                points.push(newCoords);
                segLat = newCoords[0];
                segLng = newCoords[1];
            }
            return { points, endLat: segLat, endLng: segLng, endBearing: segBearing };
        }

        console.log(`PathTracer V2: Generating main path. Total Segments: ${totalSegments}, Start Bearing: ${currentBearing.toFixed(0)}`);

        for (let s = 0; s < totalSegments; s++) {
            const mainSegmentResult = createPath(currentLat, currentLng, currentBearing, 1, segmentLengthBase, mainPathTurnAngleMax);
            
            if (mainSegmentResult.points.length > 1) {
                 const polyline = L.polyline(mainSegmentResult.points, {
                    color: child.color,
                    weight: 3, 
                    opacity: 0.7,
                    dashArray: '8, 4',
                }).addTo(map);
                allPolylines.push(polyline);
            }
            
            currentLat = mainSegmentResult.endLat;
            currentLng = mainSegmentResult.endLng;
            currentBearing = mainSegmentResult.endBearing;

            if (Math.random() < branchProbability) {
                console.log(`PathTracer V2: Creating branch at segment ${s}`);
                const branchStartBearing = (currentBearing + (Math.random() < 0.5 ? 90 : -90) + (Math.random()-0.5)*30 + 360)%360; 
                const branchResult = createPath(currentLat, currentLng, branchStartBearing, branchSegments, segmentLengthBase * branchLengthMultiplier, branchTurnAngleMax, true);
                
                if (branchResult.points.length > 1) {
                    const branchPolyline = L.polyline(branchResult.points, {
                        color: child.color,
                        weight: 2, 
                        opacity: 0.6,
                        dashArray: '4, 4',
                    }).addTo(map);
                    allPolylines.push(branchPolyline);
                }
            }
        }

        if (allPolylines.length > 0) {
            child.pathTracePolyline = allPolylines; 
            const group = new L.featureGroup(allPolylines);
            map.fitBounds(group.getBounds().pad(0.15));
            addLog(`Generated random path trace for ${child.name} with ${allPolylines.length} segments.`, 'info', 'fas fa-random', child.id);
            console.log(`PathTracer V2: Drawn ${allPolylines.length} path segments.`);
        } else {
            addLog(`Could not generate path trace for ${child.name}.`, 'alert', 'fas fa-exclamation-triangle', child.id);
            console.warn("PathTracer V2: No path segments were generated.");
        }
    }

    // --- Core Logic ---
    function moveChild(childId, lat, lng, locationName = "Selected Point") {
        if (!childId || !childStates[childId]) return; 
        const child = childStates[childId];

        if (child.geolocationDisabled) {
            addLog(`Geolocation disabled. Movement of ${child.name} to "${locationName}" not updated on map. Sensors may still update.`, 'info', 'fas fa-map-marker-slash', childId);
            const dev = child.devData;
            const tempDirection = calculateDirection(child.lastKnownGeolocation ? child.lastKnownGeolocation.lat : child.lat, child.lastKnownGeolocation ? child.lastKnownGeolocation.lng : child.lng, lat, lng);
            const directionMap = { 'North': 0, 'North East': 45, 'East': 90, 'South East': 135, 'South': 180, 'South West': 225, 'West': 270, 'North West': 315 };
            dev.compassHeading = directionMap[tempDirection] !== undefined ? directionMap[tempDirection] : dev.compassHeading;
            
            const currentMotion = motionSelect.value; 
            if (currentMotion === 'Running') { dev.accelX = (Math.random() - 0.5) * 5; dev.accelY = (Math.random() - 0.5) * 5; dev.accelZ = 9.81 + (Math.random() - 0.5) * 3; dev.micLevel = Math.min(1.0, 0.3 + Math.random() * 0.4); dev.pedometerSteps += Math.floor(Math.random() * 5) + 2; dev.lastStepTime = Date.now(); } 
            else if (currentMotion === 'Walking') { dev.accelX = (Math.random() - 0.5) * 2; dev.accelY = (Math.random() - 0.5) * 2; dev.accelZ = 9.81 + (Math.random() - 0.5); dev.micLevel = Math.min(1.0, 0.1 + Math.random() * 0.3); dev.pedometerSteps += Math.floor(Math.random() * 3) + 1; dev.lastStepTime = Date.now(); } 
            else { dev.accelX = (Math.random() - 0.5) * 0.5; dev.accelY = (Math.random() - 0.5) * 0.5; dev.accelZ = 9.81 + (Math.random() - 0.5) * 0.2; if (currentMotion === 'Stationary') dev.micLevel = Math.min(1.0, Math.random() * 0.2); }
            
            if(child.id === currentChildId) updateDeveloperTabUI(child.id);
            return; 
        }

        child.prevLat = child.lat; child.prevLng = child.lng; child.lat = lat; child.lng = lng;
        child.marker.setLatLng([lat, lng]); if (!map.getBounds().pad(0.1).contains(child.marker.getLatLng())) map.panTo([lat, lng]);
        child.direction = calculateDirection(child.prevLat, child.prevLng, child.lat, child.lng);
        recordLocationHistory(childId); addLog(`Moved to ${locationName}. Dir: ${child.direction || 'N/A'}`, 'info', 'fas fa-map-marker-alt', childId);
        
        const dev = child.devData;
        const directionMap = { 'North': 0, 'North East': 45, 'East': 90, 'South East': 135, 'South': 180, 'South West': 225, 'West': 270, 'North West': 315 };
        dev.compassHeading = directionMap[child.direction] !== undefined ? directionMap[child.direction] : dev.compassHeading;
        if (child.motion === 'Running') { dev.accelX = (Math.random() - 0.5) * 5; dev.accelY = (Math.random() - 0.5) * 5; dev.accelZ = 9.81 + (Math.random() - 0.5) * 3; dev.micLevel = Math.min(1.0, 0.3 + Math.random() * 0.4); dev.pedometerSteps += Math.floor(Math.random() * 5) + 2; dev.lastStepTime = Date.now(); } 
        else if (child.motion === 'Walking') { dev.accelX = (Math.random() - 0.5) * 2; dev.accelY = (Math.random() - 0.5) * 2; dev.accelZ = 9.81 + (Math.random() - 0.5); dev.micLevel = Math.min(1.0, 0.1 + Math.random() * 0.3); dev.pedometerSteps += Math.floor(Math.random() * 3) + 1; dev.lastStepTime = Date.now(); } 
        else { dev.accelX = (Math.random() - 0.5) * 0.5; dev.accelY = (Math.random() - 0.5) * 0.5; dev.accelZ = 9.81 + (Math.random() - 0.5) * 0.2; if (child.motion === 'Stationary') dev.micLevel = Math.min(1.0, Math.random() * 0.2); }
        if(child.id === currentChildId) updateDeveloperTabUI(child.id);

        const zoneInfo = getCurrentZoneInfo(child.lat, child.lng); if (zoneInfo && zoneInfo.type === 'Green') child.lastSafeActivityTime = Date.now();
        checkCurrentZone(childId); checkAllChildrenForIncidentProximity();
    }
    function getCurrentZoneInfo(lat, lng) { const childLatLng = L.latLng(lat, lng); const allZones = [ ...customZones.map(z => ({...z, source: 'custom'})), ...Object.values(predefinedZones).map(z => ({...z, source: 'predefined'})) ]; const zonePriorities = ['Red', 'Orange', 'Green']; for (const type of zonePriorities) { for (const zone of allZones) { if (zone.type === type && zone.bounds.contains(childLatLng)) { return { id: zone.id, type: zone.type, name: zone.name.split(' (')[0] }; } } } return null; }
    function checkCurrentZone(childId) { if (!childId || !childStates[childId] || childStates[childId].geolocationDisabled) return; const child = childStates[childId]; const zoneInfo = getCurrentZoneInfo(child.lat, child.lng); let newZoneId = null; let newZoneType = 'Undefined'; if (zoneInfo) { newZoneId = zoneInfo.id; newZoneType = zoneInfo.type; } if (child.currentZoneId !== newZoneId || child.currentZoneType !== newZoneType) { const oldZoneType = child.currentZoneType === 'Undefined' ? 'undef area' : `a ${child.currentZoneType} Zone`; const newZoneName = zoneInfo ? zoneInfo.name : 'Open Area'; child.currentZoneId = newZoneId; child.currentZoneType = newZoneType; addLog(`Left ${oldZoneType}, entered ${newZoneType} Zone (${newZoneName}).`, 'success', 'fas fa-map-pin', childId); } let appMode = 'Normal'; switch (child.currentZoneType) { case 'Green': appMode = 'Battery Saver'; if(child.appMode !== appMode) addLog("Mode: Battery Saver. SIM: Low GPS.", 'success', 'fas fa-leaf', childId); break; case 'Orange': appMode = 'High Vigilance'; if(child.appMode !== appMode && child.appMode !== 'EMERGENCY') { addLog("Mode: High Vigilance. SIM: Full log.", 'alert', 'fas fa-eye', childId); if (globalSettings.enableAmbientSound) addLog(`SIM: Ambient sound capture.`, 'action', 'fas fa-microphone-alt', childId); } break; case 'Red': appMode = 'EMERGENCY'; break; } if (child.appMode !== 'EMERGENCY') child.appMode = appMode; applyRules(childId); }
    function applyRules(childId) { if (!childId || !childStates[childId] || childStates[childId].geolocationDisabled) return; const child = childStates[childId]; const settings = globalSettings; let emergencyTriggeredThisCycle = false; if (child.altitude < settings.altitudeDropThreshold) { addLog(`RULE: Depth Anomaly! Alt: ${child.altitude}m.`, 'emergency', 'fas fa-water', childId); simulateEmergencyCall(childId, "Depth Anomaly", `Phone alt: <b>${child.altitude}m</b>.`); emergencyTriggeredThisCycle = true; } if (child.currentZoneType === 'Red' && child.appMode !== 'EMERGENCY') { addLog(`RULE: In Red Zone!`, 'emergency', 'fas fa-skull-crossbones', childId); simulateEmergencyCall(childId, "Red Zone Entry", `Entered Red Zone: <b>${getSimulatedAddress(child.lat, child.lng)}</b>.`); emergencyTriggeredThisCycle = true; } if (child.battery < settings.lowBatteryThreshold && child.battery >= 0) { if (!child.lowBatteryAlerted) { addLog(`RULE: Low Battery! Phone: ${child.battery}%.`, 'alert', 'fas fa-battery-empty', childId); showModal("Low Battery Alert", `<b>${child.name}</b>'s phone battery low (<b>${child.battery}%</b>)!`, 'alert'); child.lowBatteryAlerted = true; } } else if (child.battery >= settings.lowBatteryThreshold) delete child.lowBatteryAlerted; if (child.motion === 'In Vehicle' && child.currentZoneType === 'Orange') { if (!child.highSpeedAlerted) { addLog(`RULE: High speed in Orange Zone!`, 'alert', 'fas fa-car-crash', childId); showModal("Unusual Speed", `<b>${child.name}</b> in vehicle in Orange Zone.`, 'alert'); child.highSpeedAlerted = true; } } else delete child.highSpeedAlerted; if (emergencyTriggeredThisCycle) child.appMode = 'EMERGENCY'; if (child.id === currentChildId) updateStatusPanelForChild(childId); }
    function simulateEmergencyCall(childId, reason, description) { if (!childId || !childStates[childId]) return; const child = childStates[childId]; const locationDesc = child.geolocationDisabled && child.lastKnownGeolocation ? `Last Known: ${getSimulatedAddress(child.lastKnownGeolocation.lat, child.lastKnownGeolocation.lng)} (Geo Off)` : (getSimulatedAddress(child.lat, child.lng) || `coords ${child.lat.toFixed(4)}, ${child.lng.toFixed(4)}`); const fullDescription = `<b>EMERGENCY - ${reason}</b> for <b>${child.name}</b>.<br>Loc: ${locationDesc}.<br>Details: ${description}<br>Motion: ${child.motion}. Dir: ${child.direction || 'N/A'}. Batt: ${child.battery}%.<br><br><i>(Simulated call.)</i>`; addLog(`EMERGENCY: ${reason}. Sim 911 call.`, 'emergency', 'fas fa-phone-volume', childId); showModal(`EMERGENCY: ${reason} (${child.name})`, fullDescription, 'emergency'); child.appMode = 'EMERGENCY'; if (child.id === currentChildId) updateStatusPanelForChild(childId); }

    // --- Event Listeners ---
    btnAddChildSim.addEventListener('click', () => { const newChildName = prompt("Enter name for new child:", `Child ${nextChildSimId}`); if (newChildName && newChildName.trim() !== "") { const newId = createNewChildState(newChildName.trim()); updateChildSelectorUI(); if (newId) childSelector.value = newId; handleChildSelectionChange(); } });
    childSelector.addEventListener('change', handleChildSelectionChange);
    btnUpdateProfile.addEventListener('click', () => { if (!currentChildId || !childStates[currentChildId]) return; const child = childStates[currentChildId]; const oldName = child.name; const newName = childNameInput.value.trim(); if (newName && newName !== oldName) { child.name = newName; addLog(`Profile for "${oldName}" to ${child.name}.`, 'success', 'fas fa-user-edit', currentChildId); updateChildSelectorUI(); handleChildSelectionChange(); } else if (!newName) { addLog("Name empty.", 'alert', 'fas fa-times-circle'); childNameInput.value = oldName; } });
    btnMoveHome.addEventListener('click', () => currentChildId && moveChildToPredefinedZone(currentChildId, 'home'));
    btnMovePark.addEventListener('click', () => currentChildId && moveChildToPredefinedZone(currentChildId, 'park'));
    btnMoveDanger.addEventListener('click', () => currentChildId && moveChildToPredefinedZone(currentChildId, 'danger'));
    function moveChildToPredefinedZone(childId, zoneKey) { if (!childId || !childStates[childId] || !predefinedZones[zoneKey]) return; const targetZone = predefinedZones[zoneKey]; const center = targetZone.bounds.getCenter(); moveChild(childId, center.lat, center.lng, targetZone.name.split(' (')[0]); map.fitBounds(targetZone.bounds); }
    btnSetAltitude.addEventListener('click', () => { if (!currentChildId || !childStates[currentChildId]) return; const child = childStates[currentChildId]; const newAltitude = parseInt(altitudeInput.value); if (!isNaN(newAltitude)) { child.altitude = newAltitude; addLog(`Altitude set: ${newAltitude}m.`, 'action', 'fas fa-mountain', currentChildId); applyRules(currentChildId); } else { addLog("Invalid altitude.", 'alert', 'fas fa-times-circle', currentChildId); } });
    motionSelect.addEventListener('change', (e) => { if (!currentChildId || !childStates[currentChildId]) return; childStates[currentChildId].motion = e.target.value; addLog(`Motion: ${e.target.value}.`, 'info', getMotionIcon(e.target.value), currentChildId); applyRules(currentChildId); });
    batterySlider.addEventListener('input', (e) => { batteryValueDisplay.textContent = `${e.target.value}%`; });
    batterySlider.addEventListener('change', (e) => { if (!currentChildId || !childStates[currentChildId]) return; childStates[currentChildId].battery = parseInt(e.target.value); addLog(`Battery: ${e.target.value}%.`, 'action', 'fas fa-battery-half', currentChildId); applyRules(currentChildId); });
    btnSendChildStatus.addEventListener('click', () => { if (!currentChildId || !childStates[currentChildId]) return; const child = childStates[currentChildId]; const message = childStatusMessageSelect.value; child.lastStatusMessage = message; child.lastSafeActivityTime = Date.now(); addLog(`Status: "${message}"`, 'info', 'fas fa-comment-dots', currentChildId); showModal("Child Status", `<b>${child.name} says:</b><br>"${message}"`, 'info'); if (child.safetyCheckTimer.active && child.safetyCheckTimer.dueTime > Date.now()) { addLog(`Status satisfies safety check. Timer cleared.`, 'success', 'fas fa-check-circle', currentChildId); cancelSafetyCheckTimer(currentChildId); } updateStatusPanelForChild(currentChildId); });
    btnSimUninstall.addEventListener('click', () => currentChildId && simulateUninstallAttempt(currentChildId));
    btnSimForceShutdown.addEventListener('click', () => currentChildId && simulateForceShutdown(currentChildId));
    btnRequestCheckin.addEventListener('click', () => { if (!currentChildId) return; addLog(`Check-In request sent.`, 'action', 'fas fa-question-circle', currentChildId); showModal("Check-In Requested", `Request sent to ${childStates[currentChildId].name}.`, 'info'); });
    btnChildRespondOk.addEventListener('click', () => { if (!currentChildId || !childStates[currentChildId]) return; const child = childStates[currentChildId]; child.lastSafeActivityTime = Date.now(); addLog(`Responded: "I'm OK!"`, 'success', 'fas fa-thumbs-up', currentChildId); showModal("Check-In Response", `<b>${child.name} responded: I'm OK!</b>`, 'info'); child.lastStatusMessage = "I'm OK! (Check-In)"; if (child.safetyCheckTimer.active) cancelSafetyCheckTimer(currentChildId); updateStatusPanelForChild(currentChildId); });
    btnChildRespondHelp.addEventListener('click', () => { if(!currentChildId || !childStates[currentChildId]) return; addLog(`Responded: "NEED HELP!"`, 'emergency', 'fas fa-hands-helping', currentChildId); simulateEmergencyCall(currentChildId, `Check-In HELP`, `Responded "NEED HELP!"`); childStates[currentChildId].lastStatusMessage = "NEED HELP! (Check-In)"; updateStatusPanelForChild(currentChildId); });
    btnRingPhone.addEventListener('click', () => { if(!currentChildId || !childStates[currentChildId]) return; addLog(`SIM: Command to ring phone.`, 'action', 'fas fa-volume-up', currentChildId); showModal("Ring Phone", `Ring command to ${childStates[currentChildId].name}'s phone.`, 'info'); const child = childStates[currentChildId]; const originalIcon = child.marker.options.icon; const ringIconHtml = `<div class="child-marker-divicon ring-effect-icon" style="background-color: ${child.color}; border-color: yellow !important; transform: scale(1.3);"><i class="fas fa-bell fa-lg" style="color: ${getContrastYIQ(child.color)}; animation: pulse 1s infinite;"></i></div>`; child.marker.setIcon(L.divIcon({ html: ringIconHtml, className: '', iconSize: [30,30], iconAnchor: [15,15]})); setTimeout(() => { if (childStates[child.id]) child.marker.setIcon(createChildMarkerIcon(child.name.substring(0,1).toUpperCase(), child.color, child.id === currentChildId, child.geolocationDisabled)); }, 2500); });
    btnToggleHistory.addEventListener('click', toggleLocationHistoryUI);
    btnChildSos.addEventListener('click', () => { if(!currentChildId) return; addLog(`SOS RECEIVED!`, 'emergency', 'fas fa-exclamation-triangle', currentChildId); simulateEmergencyCall(currentChildId, `SOS Button`, `Pressed SOS button.`); });
    btnSetSafetyTimer.addEventListener('click', () => currentChildId && setSafetyCheckTimer(currentChildId));
    btnCancelSafetyTimer.addEventListener('click', () => currentChildId && cancelSafetyCheckTimer(currentChildId));
    btnStartDrawZone.addEventListener('click', startDrawingZone);
    btnCancelDrawZone.addEventListener('click', cancelDrawingZone);
    btnSimulateIncident.addEventListener('click', simulateNewIncident);
    lowBatteryThresholdInput.addEventListener('change', (e) => { globalSettings.lowBatteryThreshold = parseInt(e.target.value); addLog(`Setting: Low Batt Thres ${globalSettings.lowBatteryThreshold}%.`, 'action', 'fas fa-sliders-h'); if(currentChildId) applyRules(currentChildId); });
    altitudeDropThresholdInput.addEventListener('change', (e) => { globalSettings.altitudeDropThreshold = parseInt(e.target.value); addLog(`Setting: Alt Drop Thres ${globalSettings.altitudeDropThreshold}m.`, 'action', 'fas fa-sliders-h'); if(currentChildId) applyRules(currentChildId); });
    chkModalForAlerts.addEventListener('change', (e) => { globalSettings.modalForAlerts = e.target.checked; addLog(`Setting: Modals ${globalSettings.modalForAlerts ? 'ON' : 'OFF'}.`, 'action', 'fas fa-sliders-h'); });
    chkEnableAmbientSound.addEventListener('change', (e) => { globalSettings.enableAmbientSound = e.target.checked; addLog(`Setting: Ambient sound sim ${globalSettings.enableAmbientSound ? 'ON' : 'OFF'}.`, 'action', 'fas fa-sliders-h'); });
    
    if(btnToggleGeolocation) btnToggleGeolocation.addEventListener('click', toggleGeolocationStatus);
    if(btnPredictPath) btnPredictPath.addEventListener('click', predictAndDrawPath);

    map.on('click', function(e) {
        const activeTabEl = document.querySelector('.tab-link.active');
        const activeTabId = activeTabEl ? activeTabEl.getAttribute('onclick').match(/'([^']+)'/)?.[1] : null;
        
        if (activeTabId === 'IncidentsTab') { 
            if (incidentPlacementMarker) map.removeLayer(incidentPlacementMarker); 
            tempIncidentLatLng = e.latlng; 
            incidentPlacementMarker = L.marker(e.latlng, {draggable:true}).addTo(map).bindPopup('Incident Location (drag then "Add")').openPopup(); 
            incidentLocationInfo.textContent = `Loc set: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}.`; 
        } 
        else if (drawingZoneMode) { /* Drawing handled by events */ } 
        else if (currentChildId && childStates[currentChildId] && !childStates[currentChildId].geolocationDisabled) { 
            moveChild(currentChildId, e.latlng.lat, e.latlng.lng, "Map Click Point"); 
        } else if (currentChildId && childStates[currentChildId] && childStates[currentChildId].geolocationDisabled) {
            addLog(`Map click ignored for ${childStates[currentChildId].name} as geolocation is disabled.`, 'info', 'fas fa-ban', currentChildId);
        }
    });

    // --- Global Periodic Update Interval ---
    function startGlobalInterval() { 
        if (globalSimulationInterval) clearInterval(globalSimulationInterval); 
        globalSimulationInterval = setInterval(() => { 
            checkSafetyTimers(); 
            checkAllChildrenForIncidentProximity(); 
            if (currentChildId && childStates[currentChildId]) { 
                const child = childStates[currentChildId];
                const dev = child.devData; 
                
                if (!child.geolocationDisabled) {
                    dev.compassHeading = (dev.compassHeading + (Math.random() - 0.5) * 5 + 360) % 360;
                }
                if (child.motion === 'Stationary') dev.micLevel = Math.max(0, Math.min(1.0, dev.micLevel + (Math.random() - 0.5) * 0.1)); 
                if (Math.random() < 0.05) { const fixes = ["Strong (Satellite)", "Medium (Satellite)", "Weak (Network)", "No Fix"]; dev.gpsFixType = fixes[Math.floor(Math.random() * fixes.length)]; dev.gpsSatellites = dev.gpsFixType === "No Fix" ? 0 : Math.floor(Math.random() * 8) + 5; } 
                if (Math.random() < 0.03) { const networks = ["LTE", "5G", "3G", "Edge"]; dev.networkType = networks[Math.floor(Math.random() * networks.length)]; dev.networkStrength = Math.floor(Math.random() * 5); } 
                if (Math.random() < 0.1) { dev.wifiSSID = Math.random() < 0.5 ? "Not Connected" : (["HomeWiFi", "Starbucks_Free", "LibraryGuest"])[Math.floor(Math.random()*3)]; } 
                
                if (document.getElementById('DeveloperTab').classList.contains('active-tab')) {
                    updateDeveloperTabUI(currentChildId); 
                }
            } 
        }, 10000); 
    }

    // --- Initialization ---
    function initializeApp() {
        const firstTabButton = document.querySelector(".tab-nav .tab-link"); 
        if(firstTabButton) {
             const firstTabName = firstTabButton.getAttribute('onclick').match(/'([^']+)'/)[1];
             openTab(null, firstTabName); 
             firstTabButton.classList.add('active');
        }

        globalSettings.lowBatteryThreshold = parseInt(lowBatteryThresholdInput.value);
        globalSettings.altitudeDropThreshold = parseInt(altitudeDropThresholdInput.value);
        globalSettings.modalForAlerts = chkModalForAlerts.checked; globalSettings.enableAmbientSound = chkEnableAmbientSound.checked;

        Object.values(predefinedZones).forEach(zone => { zone.layer = L.rectangle(zone.bounds, { color: zone.color, weight: 1, fillOpacity: 0.25 }).addTo(map).bindPopup(zone.name); });
        
        initializeDrawControl(); renderCustomZonesList(); renderActiveIncidentsList();

        const defaultChildId = createNewChildState("Alex");
        updateChildSelectorUI();
        if (defaultChildId && childSelector) childSelector.value = defaultChildId;
        handleChildSelectionChange();
        
        addLog("KidSafeNet Guardian Sim Initialized.", 'success', 'fas fa-rocket');
        startGlobalInterval();
    }
    initializeApp();
});
