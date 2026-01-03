import { App, PluginSettingTab, Setting } from 'obsidian';
import PersianCalendarPlugin from './main';
import { PluginSettings } from './settings';

export default class PersianCalendarSettingTab extends PluginSettingTab {
    plugin: PersianCalendarPlugin;

    constructor(app: App, plugin: PersianCalendarPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.addPathSetting = this.addPathSetting.bind(this);
        
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
    
        containerEl.setAttribute('dir', 'rtl');
         
        containerEl.createEl('h3', { text: 'تنظیمات تقویم' });
        containerEl.createEl('p', { text: 'تقویم فارسی ابسیدین را از این طریق می‌توانید تنظیم کنید.' });
    
         
        this.addPathSetting(containerEl, 'مسیر روزنوشت‌ها', 'dailyNotesFolderPath');
        this.addFormatSetting(containerEl, 'فرمت نام فایل روزنوشت‌ها', 'dailyNotesFormat', 
            'فرمت نام فایل و پوشه‌بندی روزنوشت‌ها. مثال: YYYY/MM/YYYY-MM-DD برای ایجاد پوشه سال/ماه');
        new Setting(containerEl)
        .setName('فرمت نام‌گذاری و شناسایی روزنوشت‌ها')
        .setDesc('مشخص کنید روزنوشت‌ها با چه فرمتی نام‌گذاری شوند. این نام در Title روزنوشت‌ها قرار می‌گیرد.')
        .addDropdown(dropdown => dropdown
            .addOption('persian', 'خورشیدی')
            .addOption('georgian', 'میلادی')
            .setValue(this.plugin.settings.dateFormat || 'georgian')
            .onChange(async (value) => {
                this.plugin.settings.dateFormat = value;
                await this.plugin.saveSettings();
                this.plugin.refreshViews();  // Optionally refresh views if necessary
            }));
        this.addPathSetting(containerEl, 'مسیر هفته‌نوشت‌ها', 'weeklyNotesFolderPath');
        this.addFormatSetting(containerEl, 'فرمت نام فایل هفته‌نوشت‌ها', 'weeklyNotesFormat',
            'فرمت نام فایل و پوشه‌بندی هفته‌نوشت‌ها. مثال: YYYY/YYYY-[W]WW');
        this.addPathSetting(containerEl, 'مسیر ماه‌نوشت‌ها', 'monthlyNotesFolderPath');
        this.addFormatSetting(containerEl, 'فرمت نام فایل ماه‌نوشت‌ها', 'monthlyNotesFormat',
            'فرمت نام فایل و پوشه‌بندی ماه‌نوشت‌ها. مثال: YYYY/YYYY-MM');
        this.addPathSetting(containerEl, 'مسیر فصل‌نوشت‌ها', 'quarterlyNotesFolderPath');
        this.addFormatSetting(containerEl, 'فرمت نام فایل فصل‌نوشت‌ها', 'quarterlyNotesFormat',
            'فرمت نام فایل و پوشه‌بندی فصل‌نوشت‌ها. مثال: YYYY/YYYY-[Q]Q');
        this.addPathSetting(containerEl, 'مسیر سال‌نوشت‌ها', 'yearlyNotesFolderPath');
        this.addFormatSetting(containerEl, 'فرمت نام فایل سال‌نوشت‌ها', 'yearlyNotesFormat',
            'فرمت نام فایل و پوشه‌بندی سال‌نوشت‌ها. مثال: YYYY');
        new Setting(containerEl)
            .setName('فعال‌سازی نمایش فصل‌نوشت‌ها در تقویم')
            .setDesc('نمایش یا پنهان کردن ردیف فصل‌نوشت‌ها در نمای تقویم')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableQuarterlyNotes)
                .onChange(async (value) => {
                    this.plugin.settings.enableQuarterlyNotes = value;
                    await this.plugin.saveSettings();
                    this.plugin.refreshViews();
                }));
        new Setting(containerEl)
        .setName('فعال‌سازی نمایش تقویم میلادی')
        .setDesc('می‌توانید مشخص کنید تقویم میلادی زیر تقویم شمسی نمایش داده شود.')
        .addToggle(toggle => toggle
            .setValue(this.plugin.settings.showGeorgianDates)
            .onChange(async (value) => {
                this.plugin.settings.showGeorgianDates = value;
                await this.plugin.saveSettings();
                this.plugin.refreshViews();
            }));

        new Setting(containerEl)
            .setName('نمایش تقویم هجری قمری')
            .setDesc('می‌توانید مشخص کنید تقویم هجری قمری کنار تقویم هجری شمسی نمایش داده شود.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showHijriDates)
                .onChange(async (value) => {
                    this.plugin.settings.showHijriDates = value;
                    await this.plugin.saveSettings();
                    this.plugin.refreshViews();
                }));
        

        // new Setting(containerEl)
        //     .setName('تقویم هجری قمری')
        //     .setDesc('انتخاب تنظیمات تقویم هجری قمری بین ایران و تقویم رسمی عربستان.')
        //     .addDropdown(dropdown => dropdown
        //         .addOption('iran', 'ایران')
        //         .addOption('ummalqura', 'ام‌القرى')
        //         .setValue(this.plugin.settings.hijriCalendarType)
        //         .onChange(async (value) => {
        //             this.plugin.settings.hijriCalendarType = value;
        //             await this.plugin.saveSettings();
        //             this.plugin.refreshViews();
        //         }));
        
        new Setting(containerEl)
            .setName('نمایش روزهای تعطیل رسمی در تقویم')
            .setDesc('مشخص کنید آیا مایلید روزهای تعطیل رسمی در تقویم با رنگ قرمز نمایش داده شوند یا خیر.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showHolidays)
                .onChange(async (value) => {
                    this.plugin.settings.showHolidays = value;
                    await this.plugin.saveSettings();
                    this.plugin.refreshViews();
                }));


        new Setting(containerEl)
            .setName('روزهای تعطیل هفته')
            .setDesc('مشخص کنید چه روزهایی در هفته با رنگ قرمز  به عنوان تعطیلی نمایش داده شوند')
            .addDropdown(dropdown => dropdown
                .addOption('friday', 'جمعه')
                .addOption('thursday-friday', 'پنجشنبه و جمعه')
                .addOption('friday-saturday', 'جمعه و شنبه')
                .setValue(this.plugin.settings.weekendDays)
                .onChange(async (value) => {
                    this.plugin.settings.weekendDays = value;
                    await this.plugin.saveSettings();
                    this.plugin.refreshViews();
                }));
        new Setting(containerEl)
            .setName('نمایش تعطیلات رسمی تقویم ایران')
            .setDesc('مشخص کنید آیا مایلید رویدادهای تقویم رسمی ایران در تولتیپ و {{مناسبت}} نمایش داده شود یا خیر')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showOfficialIranianCalendar)
                .onChange(async (value) => {
                    this.plugin.settings.showOfficialIranianCalendar = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('نمایش رویدادهای تقویم ایران باستان')
            .setDesc('مشخص کنید آیا مایلید رویدادهای تقویم ایران باستان در تولتیپ و {{مناسبت}} نمایش داده شود یا خیر.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showAncientIranianCalendar)
                .onChange(async (value) => {
                    this.plugin.settings.showAncientIranianCalendar = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName('نمایش رویدادهای تقویم شیعی')
            .setDesc('مشخص کنید آیا مایلید رویدادهای تقویم شیعی در تولتیپ و {{مناسبت}} نمایش داده شود یا خیر.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showShiaCalendar)
                .onChange(async (value) => {
                    this.plugin.settings.showShiaCalendar = value;
                    await this.plugin.saveSettings();
                })
            );
        

        new Setting(containerEl)
        .setName('مدت زمان تاخیر در اجرای {{عبارت‌های معنادار}}')
        .setDesc('{{عبارت‌های معنادار}} پس از ساخته شدن فایل با تاخیر زمانی اجرا می‌گردند. در سیستم‌های با قدرت پایین تر این مقدار را افزایش دهید. (مقدار پیش‌فرض: 1250 میلی‌ثانیه)')
        .addText(text => text
            .setPlaceholder('Enter timeout duration')
            .setValue(this.plugin.settings.timeoutDuration.toString())
            .onChange(async (value) => {
                this.plugin.settings.timeoutDuration = parseInt(value);
                await this.plugin.saveSettings();
            }));
        
        
        const githubadvice = containerEl.createEl('p');
        githubadvice.appendText('پیش از هر اقدامی توصیه می‌کنم راهنمای افزونه در ');
        githubadvice.createEl('a', { text: 'گیت‌هاب', href: 'https://github.com/maleknejad/obsidian-persian-calendar' });
        githubadvice.appendText(' را مطالعه کنید و با ویژگی‌هایی که این افزونه در اختیارتان قرار می‌دهد آشنا شوید.');
        
        containerEl.createEl('h4', { text: 'راهنمای فرمت‌های تاریخ' });
        const formatHelp = containerEl.createEl('p');
        formatHelp.appendText('در فرمت‌های تاریخ می‌توانید از کدهای زیر استفاده کنید: ');
        formatHelp.createEl('br');
        formatHelp.appendText('YYYY: سال چهار رقمی، MM: ماه دو رقمی، DD: روز دو رقمی');
        formatHelp.createEl('br');
        formatHelp.appendText('WW: شماره هفته، Q: شماره فصل');
        formatHelp.createEl('br');
        formatHelp.appendText('برای ایجاد پوشه‌های جداگانه از "/" استفاده کنید. مثال: YYYY/MM/YYYY-MM-DD');
        formatHelp.createEl('br');
        formatHelp.appendText('توجه: عبارت‌های معنادار ({{این روز}}) با فرمت‌های استاندارد (YYYY-MM-DD) بهتر کار می‌کنند.');
        
        containerEl.createEl('p', { text: 'مسیرها را قبل از تنظیم کردن در ابسیدین ایجاد کنید. مسیرها باید بدون "/" در ابتدای آن باشد.' });
        containerEl.createEl('p', { text: 'برای اعمال تغییرات، لازم است تقویم را از تنظیمات ابسیدین مجددا فعال کنید.' });
        const templaterparagraph = containerEl.createEl('p');
        templaterparagraph.appendText('برای تنظیم کردن قالب برای نوشته‌ها می‌توانید از افزونه ');
        templaterparagraph.createEl('a', { text: 'Templater', href: 'https://github.com/SilentVoid13/Templater' }),
        templaterparagraph.appendText(' استفاده کنید. راهنمای استفاده از آن در '),
        templaterparagraph.createEl('a', { text: 'گیت‌هاب', href: 'https://github.com/maleknejad/obsidian-persian-calendar/' }),
        templaterparagraph.appendText(' نوشته شده است. حتما راهنمای افزونه را مطالعه کنید.');
        const paragraph = containerEl.createEl('p');
        paragraph.appendText('در صورت مشاهده باگ و یا ارائه پیشنهاد و یا درخواست راهنمایی لطفا در ');
        paragraph.createEl('a', { text: 'گیت‌هاب', href: 'https://github.com/maleknejad/obsidian-persian-calendar/' }),
        paragraph.appendText(' به اشتراک بگذارید.'),
        paragraph.createEl('br'),
        paragraph.createEl('br'),
        paragraph.createEl('br'),
        paragraph.appendText(' ‌توسعه‌یافته توسط حسین ملک نژاد، برای حمایت و پیگیری توسعه پلاگین‌های ابسیدین '),
        paragraph.createEl('a', { text: 'کارفکر', href: 'https://t.me/karfekr' }),
        paragraph.appendText(' را دنبال کنید.'),
        paragraph.createEl('br'),
        paragraph.appendText(' نسخه 3.0.1');
    }
    

    addPathSetting(containerEl: HTMLElement, name: string, settingKey: keyof PluginSettings) {
        new Setting(containerEl)
            .setName(name)
            .addText(text => text
                .setPlaceholder('Path/for/notes')
                .setValue(this.plugin.settings[settingKey] as string)
                .onChange(async (value) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (this.plugin.settings as any)[settingKey] = value;
                    await this.plugin.saveSettings();
                }));
    }

    addFormatSetting(containerEl: HTMLElement, name: string, settingKey: keyof PluginSettings, description: string) {
        new Setting(containerEl)
            .setName(name)
            .setDesc(description)
            .addText(text => text
                .setPlaceholder('YYYY-MM-DD')
                .setValue(this.plugin.settings[settingKey] as string)
                .onChange(async (value) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (this.plugin.settings as any)[settingKey] = value;
                    await this.plugin.saveSettings();
                }));
    }
      
}



