import { style, theme } from "../lib.js"
import FpsCounter from "./fps-counter.js"
import BnbStartScreen from "./start-screen.js"

export default {
  data: () => ({ 
    source: "none",
    imageFiles: [], // to store image files
    isRecording: false, // to store the recording state
    fakewebcamInterval: null, // to store the interval
  }),
  components: { BnbStartScreen, FpsCounter },
  methods: {
    onPhotoUploaded(photo) {
      this.$emit("photo-uploaded", photo)
      this.source = "photo"
    },
    onCameraRequest() {
      this.$emit("camera-request")
      this.source = "camera"
    },
    onCloseRequest() {
      this.$emit("close-request")
      this.source = "none"
      this.stopFakeWebcam()
    },

    handleFolderUpload(event) {
      const files = Array.from(event.target.files);
      this.imageFiles = files.filter((file) => file.type.startsWith('image/'));

      //start fake webcam
      this.startFakeWebcam();
    },

    startFakeWebcam() {
      if(this.imageFiles.length == 0){
        console.log(`No image files to display`);
        return;
      }
      this.source = "photo";

      let index = 0;
      let totalFrames = this.imageFiles.length;

      this.fakewebcamInterval = setInterval(() => {
        
        //display the current frame
        this.$emit("photo-uploaded", URL.createObjectURL(this.imageFiles[index]));

        //Trigger a frame change event
        document.dispatchEvent(new CustomEvent('frameChange', { detail: { frame: index } }));
        console.log(`Frame changed to: ${index}`);
        //this.recordFrame(index);
        this.$emit('screenshot-request');

        //move to the next frame
        index = (index + 1) % totalFrames;
      }, 1000/1); // 1fps
    },
    stopFakeWebcam() {
      if (this.fakewebcamInterval) {
        clearInterval(this.fakewebcamInterval);
        this.fakewebcamInterval = null;
        this.source = "none";
      }
    },
    clearUploadedPhotos() {
      this.imageFiles = [];
      this.stopFakeWebcam();
    }
  },
  computed: {
    closeBtnText: ({ source }) => {
      if (source === "camera") return "Close camera"
      if (source === "photo") return "Close photo"
      return ""
    },
  },
  template: /* HTML */ `
  <div class="is-flex is-flex-direction-column is-relative bnb-viewer">
    <slot></slot>
    <bnb-start-screen
    v-if="source === 'none'"
      class="bnb-viewer__start_screen"
      @photo-uploaded="onPhotoUploaded($event)"
      @camera-request="onCameraRequest()"
    />
    <div class="bnb-viewer__controls">
      <div class="p-2 bnb-viewer__controls-dock">
        <input type="file" webkitdirectory multiple @change="handleFolderUpload($event)" />
        <b-button
          class="pl-4 pr-4"
          type="is-link"
          icon-left="camera"
          @click="$emit('screenshot-request')"
          rounded
          inverted
        />
        <b-button
          class="pl-4 pr-4"
          type="is-link"
          icon-left="record"
          :label = 'recordBtnText'
          @click = "$emit('start-recording')"
          roundedscreenshot
          
        <b-button
      <fps-counter class="bnb-viewer__fps" />
      <b-button
        class="pl-3 pr-3 is-uppercase is-clipped bnb-viewer__close-btn"
        type="is-small"
        icon-left="clear"
        :label="closeBtnText"
        @click="onCloseRequest()"
        rounded
      />
    </div>
      </div>
`,

  style: /* CSS */ `
  .bnb-viewer {
    width: 100%;
  }
  .bnb-viewer__start_screen {
    position: absolute !important;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .bnb-viewer > *:first-child:not(:empty) ~ * {
    display: block;
  }
  .bnb-viewer > *:first-child:not(:empty) + * {
    display: none;
  }
  .bnb-viewer__controls {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .bnb-viewer__controls * {
    pointer-events: all;
  }
  .bnb-viewer__controls-dock {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    border-radius: 16px;
    background: rgba(10, 10, 10, 0.3);
    transform: translateX(-50%);
  }
  .button.bnb-viewer__close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    justify-content: flex-start;
    max-width: 30px;
    background: rgba(10, 10, 10);
    opacity: 0.3;
    transition: max-width 0.25s ease-out, opacity 0.25s ease-out;
  }
  .button.bnb-viewer__close-btn > .icon {
    color: ${theme.colors.light};
    margin-left: -6px !important;
    margin-right: 6px !important;
  }
  .button.bnb-viewer__close-btn:hover {
    max-width: 100%;
    opacity: 0.5;
    transition: max-width 0.3s ease-in, opacity 0.3s ease-in;
  }
  .bnb-viewer__fps {
    display: block;
    position: absolute;
    top: 1rem;
    left: 1rem;
  }
`
}
