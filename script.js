import { addMilliseconds, format } from '/api/code/yosider-scripts/date-fns.min.js/script.js';

// constants
const workPeriod = 25 * 60 * 1000;  // msec
const breakPeriod = 5 * 60 * 1000;
// debug
//const workPeriod = 5 * 1000;  
//const breakPeriod = 5 * 1000;

const title = 'Pomodoro Timer';
const image = 'https://gyazo.com/978797f03cb0112a0a4cafdf02dcdde8/raw';
const notificationOptions = { body: `With đ by ${title}`, icon: image };

class Pomodoro {
  constructor() {
    scrapbox.PageMenu.addMenu({ title, image, onClick: () => Pomodoro.requestPermission() });
    this.menu = scrapbox.PageMenu(title);
    this.reset();
  }

  // åŽæ°ãŽč¨­åŽ
  get startWorkButton() { return { title: '\uf04bī¸ Start Work', onClick: () => this.startWork() }; }
  get stopWorkButton() { return { title: '\uf04d Stop Work', onClick: () => this.stopWork() }; }
  get startBreakButton() { return { title: '\uf0f4 Start Break ', onClick: () => this.startBreak() }; }
  get stopBreakButton() { return { title: '\uf04d Stop Break', onClick: () => this.stopBreak() }; }
  get timerDisplay() { return { title: '--:--', onClick: () => { } }; }

  reset() {
    this.isRunning = false;
    this.isWorkPeriod = false;
    this.intervalID = undefined;
    this.startTime = undefined;
    this.endTime = undefined;
    this.timeoutID = undefined;
    this.setItems(this.startWorkButton);
  }
  setItems(...items) {
    this.menu.removeAllItems();
    items.forEach(i => this.menu.addItem(i));
  }
  start(period, callback) {
    this.isRunning = true;
    this.startTime = new Date();
    this.endTime = addMilliseconds(this.startTime, period);
    this.intervalID = setInterval(() => callback(), period);
    this.timeoutID = this.setUpdateTimerLoop();
  }
  startWork() {
    this.start(workPeriod, () => this.stopWork('ããĸããŧã­ãåŽäēããžããã'));
    this.setItems(this.timerDisplay, this.stopWorkButton);
  }
  startBreak() {
    this.start(breakPeriod, () => this.stopBreak('äŧæŠæéãįĩäēããžããã'));
    this.setItems(this.timerDisplay, this.stopBreakButton);
  }
  stop(msg = '') {
    this.isRunning = false;
    clearTimeout(this.timeoutID);
    clearInterval(this.intervalID);
  }
  stopWork(msg = '') {
    this.stop();
    this.setItems(this.startBreakButton);
    if (msg) new Notification(msg, notificationOptions);
    // record
    const endTime = new Date();
    const page = `/${scrapbox.Project.name}/${encodeURIComponent(format(endTime, 'yyyy/M/d'))}`;
    const log = `${format(this.startTime, 'HH:mm')} -> ${format(endTime, 'HH:mm')}: [${scrapbox.Page.title}]\n`;
    window.open(`${page}?body=${encodeURIComponent(log)}`);
  }
  stopBreak(msg = '') {
    this.stop();
    this.setItems(this.startWorkButton);
    if (msg) new Notification(msg, notificationOptions);
  }
  setUpdateTimerLoop() {
    if (!this.isRunning) return;
    this.menu.menus.get(title).items[0].title = format(this.endTime - new Date(), 'mm:ss'); // FIXME: itemãŽ0įĒįŽãĢæč¨ãããã¨ãã
    this.menu.emitChange();
    this.timeoutID = setTimeout(() => this.setUpdateTimerLoop(), 1000);
  }

  static async requestPermission() {
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') throw Error('Permission denied.');
    const state = await Notification.requestPermission();
    if (state !== 'granted') throw Error('Permission denied.');
  }
}

const pomodoro = new Pomodoro();
