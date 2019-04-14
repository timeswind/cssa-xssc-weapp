import { observable } from 'mobx'

const globalStore = observable({
  deviceModel: "",
  windowHeight: 0,
  currentSectionTitle: '',
  currentSection: '',
  toView: 'toView',
  yearbookVersion: '', //default version
  setDevice(device_name) {
    this.deviceModel = device_name
  },
  setWindowHeight(height) {
    this.windowHeight = height
  },
  setCurrentSectionTitle(title) {
    this.currentSectionTitle = title
  },
  setCurrentSection(sectionKey) {
    this.currentSection = sectionKey
  },
  setToView(toView) {
    this.toView = toView
  },
  setYearbookVersion(version) {
    this.yearbookVersion = version;
  }
})
export default globalStore