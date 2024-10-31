import omit from "https://cdn.jsdelivr.net/npm/lodash-es/omit.min.js";
import Store from "../store.js";
import BnbSetting from "./components/setting.js";
import Config from "./data/presets.js";
import * as stores from "./stores/index.js";
import JSZip from "https://cdn.skypack.dev/jszip";

let selectedPreset = null;

const applyPreset = (preset) => {
  selectedPreset = omit(preset, "name");

  Store.reset();

  for (const [name, value] of Object.entries(selectedPreset)) stores[name].update(value);

  // Emit the current preset to other documents
  const event = new CustomEvent("presetApplied", { detail: selectedPreset });
  console.log("presetApplied", selectedPreset);
  window.dispatchEvent(event);
};

const resetPresets = () => {
  if (!selectedPreset) return;

  for (const [name, value] of Object.entries(selectedPreset))
    if (stores[name]?.isEqual(value)) stores[name].reset(...Object.keys(value));

  
  selectedPreset = null;
  const event = new CustomEvent("presetApplied", { detail: selectedPreset });
  window.dispatchEvent(event);
};




const handleCsvUpload = (event) => {
  const file = event.target.files[0];
  Papa.parse(file, {
    header: true,
    complete: (results) => {
      const rows = results.data;
      console.log("CSV Data:");
      rows.forEach((row, index) => {
        console.log(`Row ${index + 1}:`);
        for (const [key, value] of Object.entries(row)) {
          console.log(`  ${key}: ${value}`);
          // Dynamically create variables
          window[key] = value;
        }
      });

      // Print the contents of the CSV, assuming the first row is the name
      rows.forEach((row) => {
        console.log(`Name: ${row.name}`);
        for (const [key, value] of Object.entries(row)) {
          if (key !== "name") {
            console.log(`  ${key}: ${value}`);
          }
         
        }

        console.log("Row:", row);
        Config.push({ name: row.Name, 
          morphs: { face: { strength:  row.FaceMorph_face}, nose: { strength: row.FaceMorph_nose}, eyes:{strength: row.FaceMorph_eyes},lips: { strength: row.FaceMorph_lips }, eyes: { strength: row.FaceMorph_eyes }}, 
          teethWhitening: { strength: row.Teeth_whitening },  
          eyes: {flare: {strength: row.Eyes_flare}, whitening: {strength: row.Eyes_whitening}},
          skin: {softening: {strength: row.Skin_softening} }, 
          softlight: {strength: row.Softlight} 
       })
      });
    },
    error: (error) => {
      console.error("Error parsing CSV:", error);
    },
  });
};

export default {
  data: () => ({
    presets: Config,
    showZipButton: false,
    csvData: [],
    showCsvButtons: false,
    zipFiles: [], // Add this line
  }),
  methods: {
    applyPreset,
    resetPresets,
    handleCsvUpload,
  },
  components: { BnbSetting },
  template: /* HTML */ `
    <bnb-setting @reset="resetPresets">
      <div class="is-flex is-flex-direction-column">
        <b-button
          v-for="preset in presets"
          :key="preset.name"
          class="mt-2 mb-2"
          type="is-link is-inverted"
          @click="applyPreset(preset)"
        >
          {{ preset.name }}
        </b-button>
        
        <input id="csvUpload" type="file" accept=".csv" @change="handleCsvUpload" />
        <b-button
          v-if="showZipButton"
          class="mt-2 mb-2"
          type="is-link is-inverted"
          @click="processZip"
        >
          Process Zip File
        </b-button>
        <div v-if="showCsvButtons">
          <b-button
            v-for="(row, index) in csvData"
            :key="index"
            class="mt-2 mb-2"
            type="is-link is-inverted"
            @click="applyPreset(row)"
          >
            {{ row.name }}
          </b-button>
        </div>
        <div>
          <b-button
            v-for="file in zipFiles"
            :key="file"
            class="mt-2 mb-2"
            type="is-link is-inverted"
          >
            {{ file }}
          </b-button>
        </div>
      </div>
    </bnb-setting>
  `,
};
