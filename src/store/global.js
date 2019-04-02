import { observable } from 'mobx'

const globalStore = observable({
  deviceModel: "",
  setDevice(device_name) {
    this.deviceModel = device_name
  }
})
export default globalStore