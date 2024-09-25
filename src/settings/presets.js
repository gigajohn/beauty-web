import omit from "https://cdn.jsdelivr.net/npm/lodash-es/omit.min.js"
import Store from "../store.js"
import BnbSetting from "./components/setting.js"
import Config from "./data/presets.js"
import * as stores from "./stores/index.js"

let selectedPreset = null

const applyPreset = (preset) => {
  selectedPreset = omit(preset, "name")

  Store.reset()

  for (const [name, value] of Object.entries(selectedPreset)) stores[name].update(value)
}

const resetPresets = () => {
  if (!selectedPreset) return

  for (const [name, value] of Object.entries(selectedPreset))
    if (stores[name]?.isEqual(value)) stores[name].reset(...Object.keys(value))

  selectedPreset = null
}

const handleFolderUpload = (event) => {
  const files = event.target.files;

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageUrl = e.target.result;
        // Process the image content (e.g., display it)
        console.log(`Image: ${file.name}`);
        console.log(imageUrl);
        //this.$emit("photo-uploaded", imageUrl)
        //this.source = "photo"
        
        
      };

      reader.onerror = (e) => {
        console.error(`Error reading file ${file.name}:`, e);
      };

      reader.readAsDataURL(file);
    } else {
      console.log(`Skipping non-image file: ${file.name}`);
    }
  }
};

export default {
  data: () => ({ presets: Config }),
  methods: { applyPreset, resetPresets, handleFolderUpload },
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
        <input type="file" webkitdirectory @change="handleFolderUpload" />
      </div>
    </bnb-setting>
  `,
}
