const WEED_STR = ['日', '月', '火', '水', '木', '金', '土'];

export default class Calendar {
    private d: Date;

    constructor(arg?: Date | string | undefined) {
        try {
            if (arg) {
                if (typeof arg === 'string') {
                    arg = arg.trim();
                    if (arg.length === 8) {
                        // 8桁の場合は 4 2 2 に分解
                        const year = arg.substring(0, 4);
                        const month = arg.substring(4, 6);
                        const day = arg.substring(6, 8);
                        arg = `${year}-${month}-${day} 00:00:00`;
                    }
                    arg = arg.replace(/\//g, '-'); // スラッシュをハイフンに
                    arg = arg.replace(/ /g, 'T'); // スペースをT区切りに
                    if (arg.length > 10) {
                        if (arg.substring(arg.length - 1) === 'Z') {
                            // タイムゾーン指定（世界標準時）がついていたら消す（時間情報は正しくないため日付のみにする）
                            // カレンダーで選択した日付＋ランダムな時間？＋UTC（.000Z）　の形式になっている
                            arg = arg.substring(0, 10);
                        } else {
                            arg = arg + '+09:00'; // iOSの場合にタイムゾーンがUTCになってしまうため+9時間する
                        }
                    }
                }
                this.d = new Date(arg);
                if (Number.isNaN(this.d.getTime())) {
                    console.log('Invalid Date! ', arg);
                    this.d = new Date();
                }
            } else {
                this.d = new Date();
            }
        } catch (error) {
            // fallback today
            this.d = new Date();
        }
    }

    static now() {
        return new Calendar();
    }

    // Dateオブジェクトにnum値を加算、num値がマイナスの場合は減算
    modify(num: number, interval: string) {
        let cal = new Calendar(this.d);
        switch (interval) {
            case 'Y':
                cal.d.setFullYear(cal.d.getFullYear() + num);
                break;
            case 'M':
                cal.d.setMonth(cal.d.getMonth() + num);
                break;
            case 'D':
                cal.d.setDate(cal.d.getDate() + num);
                break;
            case 'H':
                cal.d.setHours(cal.d.getHours() + num);
                break;
            case 'I':
                cal.d.setMinutes(cal.d.getMinutes() + num);
                break;
            case 'S':
                cal.d.setSeconds(cal.d.getSeconds() + num);
                break;
            default:
                cal.d.setDate(cal.d.getDate() + num);
        }
        return cal;
    }

    getObject() {
        return this.d;
    }

    getYear() {
        return this.d.getFullYear();
    }
    getMonth() {
        return this.d.getMonth() + 1;
    }
    getDate() {
        return this.d.getDate();
    }
    getHours() {
        return this.d.getHours();
    }
    getMinutes() {
        return this.d.getMinutes();
    }
    getSeconds() {
        return this.d.getSeconds();
    }
    getTime() {
        return this.d.getTime();
    }
    getDay() {
        return this.d.getDay(); // 曜日 sun=0,,,,sat=6
    }
    getWeekStr() {
        return WEED_STR[this.d.getDay()];
    }

    isToday() {
        return this.format('Y-m-d') === Calendar.now().format('Y-m-d');
    }

    format(args: string) {
        let s = '';
        for (let i = 0; i < args.length; i++) {
            let c = args.charAt(i);
            if (c === 'Y') {
                s += this.d.getFullYear();
            } else if (c === 'm') {
                s += ('00' + (this.d.getMonth() + 1)).slice(-2);
            } else if (c === 'n') {
                s += this.d.getMonth() + 1;
            } else if (c === 'd') {
                s += ('00' + this.d.getDate()).slice(-2);
            } else if (c === 'H') {
                s += ('00' + this.d.getHours()).slice(-2);
            } else if (c === 'h') {
                s += this.d.getHours();
            } else if (c === 'i') {
                s += ('00' + this.d.getMinutes()).slice(-2);
            } else if (c === 's') {
                s += ('00' + this.d.getSeconds()).slice(-2);
            } else if (c === 't') {
                // 今月の末日
                let last = new Date(this.d.getFullYear(), this.d.getMonth() + 1, 0);
                s += last.getDate();
            } else if (c === 'j') {
                s += this.d.getDate();
            } else if (c === 'W') {
                // 日本語曜日1桁
                s += WEED_STR[this.d.getDay()];
            } else {
                s += c;
            }
        }
        return s;
    }

    addDate(num: number) {
        let cal = new Calendar(this.d);
        cal.d.setDate(cal.d.getDate() + num);
        return cal;
    }
    addMonth(num: number) {
        let cal = new Calendar(this.d);
        cal.d.setMonth(cal.d.getMonth() + num);
        return cal;
    }

    toNextMonth() {
        let ym = this.format('Y-m');
        let cal = this.addDate(28 - this.d.getDate());
        while (cal.format('Y-m') === ym) {
            cal = cal.addDate(1);
        }
        return cal;
    }
    toPrevMonth() {
        let ym = this.format('Y-m');
        let cal = this.addDate(28 - this.d.getDate());
        while (cal.format('Y-m') === ym) {
            cal = cal.addDate(-1);
        }
        return cal;
    }
    toNextDate() {
        return this.addDate(1);
    }
    toPrevDate() {
        return this.addDate(-1);
    }
    toFirstOfMonth() {
        let days = this.d.getDate();
        return this.addDate(-1 * (days - 1));
    }
    toLastOfMonth() {
        let last = new Date(this.d.getFullYear(), this.d.getMonth() + 1, 0);
        let cal = new Calendar(this.d);
        cal.d.setDate(last.getDate());
        return cal;
    }

    clone() {
        return new Calendar(this.d);
    }

    // static toTime(seconds: number) {
    //     seconds = Math.max(seconds, 0);
    //     let h = parseInt(seconds / 3600);
    //     let m = parseInt((seconds % 3600) / 60);
    //     let s = parseInt(seconds % 60);
    //     return [h ,m, s];
    // }

    static toHMS(datetime: Date) {
        let ts = new Calendar(datetime);
        return ts.format('H:i:s');
    }

    // Override
    toString() {
        return this.format('Y-m-d H:i:s');
    }
    // Override
    toJSON() {
        return this.format('Y-m-d H:i:s');
    }
}
