"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const snpm = new ColorfulStreetsMap("map", 13.725, 51.035, 12); // configure latitude, longitude and zoom level
    snpm.addOSMBackground(0.3); // comment out this line, if you do not want the OSM background tiles
    snpm.addVectors("Dresden-clipped-highways.osm"); // configure filename of OSM data file
}, false);

/**
 * Geographical map with colored streets based on their name patterns.
 */
class ColorfulStreetsMap {
    /**
     * Defines HTML colors for regular expression in a map and sets up the geographical map.
     *
     * @param {string} renderTarget - target HTML element id to render the map to
     * @param {number} latitude - latitude to center the map to
     * @param {number} longitude - longitude to center the map to
     * @param {number} zoom - zoom level
     * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html}
     */
    constructor(renderTarget, latitude, longitude, zoom) {
        const c = new Map();
        c.set(/er? Straße$/, "#84a883");
        c.set(/er Platz$/, "#4aa03a");

        c.set(/^\S+straße$/, "#84acd1");
        c.set(/^\S+platz$/, "#547bbe");

        c.set(/^\S+-Straße$/, "#e2b273");
        c.set(/^\S+-Platz$/, "#b57b17");

        c.set(/([wW]eg|[pP]fad)$/, "#654d29");
        c.set(/([aA]llee|[wW]iese|[aA]ue|[fF]lügel|[hH]ain|[pP]ark)$/, "#1e7200");
        c.set(/([rR]ing|[rR]ingel|[wW]inkel|[lL]eite)$/, "#b50042");
        c.set(/([bB]rücke|[sS]teig|[hH]öhe|[bB]lick)$/, "#b55400");
        c.set(/([uU]fer|[gG]raben|[gG]rund|[tT]eich|[hH]afen|[sS]teg|[sS]chlucht)$/, "#1e48a4");
        c.set(/([gG]asse|[gG]äßchen)$/, "#d0c000");
        c.set(/([bB]erg|[gG]arten|[hH]of|[mM]arkt)$/, "#b55e9a");

        c.set(/^(Am|An der|An den|Zum|Zur) .+/, "#999999");
        c.set(/^Alt\S+$/, "#555555");
        c.set(/^(Alte|Große|Kleine) /, "#623072");
        this.colors = c;

        this.geomap = new ol.Map({
            target: renderTarget, // assign map to HTML element
            controls: [], // prevent adding controls
            view: new ol.View({
                center: ol.proj.transform([latitude, longitude], "EPSG:4326", "EPSG:3857"),
                zoom: zoom
            })
        });
    }

    /**
     * Returns an HTML color representing a certain street name pattern defined via a regular expression.
     *
     * @param {string} name - name of the feature (street) to check
     * @return {string} An HTML color used to style the feature
     */
    getColor(name) {
        for (const key of this.colors.keys()) {
            if (key.test(name)) return this.colors.get(key);
        }
        return "#000000";
    }

    /**
     * Adds a background layer with ordinary OpenStreetMaps tiles.
     *
     * @param {number} opacity - opacity of OSM tiles
     * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile.html}
     */
    addOSMBackground(opacity) {
        new ol.layer.Tile({
            map: this.geomap, // assign layer to map
            source: new ol.source.OSM(),
            opacity: opacity
        });
    }

    /**
     * Adds vectors based on a data file to the geographical map.
     *
     * @param {string} filename - filename of data file in OSMXML format
     * @see {@link https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector.html}
     */
    addVectors(filename) {
        new ol.layer.Vector({
            map: this.geomap, // assign layer to map
            source: new ol.source.Vector({
                url: filename, // load data file
                format: new ol.format.OSMXML()
            }),
            renderMode: "image", // "vector" method is slower
            style: feature => {
                const name = feature.get("name"); // retrieve feature name
                if (undefined === name) return new ol.style.Style({}); // do not render unused features
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: this.getColor(name),
                        width: 4
                    })
                });
            }
        });
    }
}
