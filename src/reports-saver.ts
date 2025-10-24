import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Doc, DocType } from './doc-design.js';

class ReportsSaver {
  private saveDir?: string;
  private percentage: number;
  private savedCount = 0;
  private reportsByUser: Map<string, Doc[]> = new Map();
  private facilityToUser: Map<string, string> = new Map();
  private currentUser?: string;

  constructor(saveDir: string, percentage: number) {
    this.saveDir = saveDir;
    this.percentage = percentage;
  }

  async saveReports(docs: Doc[]): Promise<Doc[]> {
    if (!this.saveDir) {
      return [];
    }

    const userSettingsDoc = docs.find(doc => doc.type === 'user-settings');
    if (userSettingsDoc && 'name' in userSettingsDoc && 'facility_id' in userSettingsDoc) {
      const username = userSettingsDoc.name as string;
      const facilityId = userSettingsDoc.facility_id as string;
      this.facilityToUser.set(facilityId, username);
      this.currentUser = username;
    }
    
    const reports = docs.filter(doc => doc.type === DocType.dataRecord);    
    if (reports.length === 0) {
      return [];
    }
    const reportsToSave = reports.filter(() => Math.random() * 100 < this.percentage);    
    if (reportsToSave.length === 0) {
      return [];
    }

    for (const report of reportsToSave) {
      let username = this.currentUser;
      
      if ('contact' in report && report.contact && typeof report.contact === 'object') {
        const contact: any = report.contact;
        let current = contact;
        while (current && current.parent) {
          if (current.parent._id && this.facilityToUser.has(current.parent._id)) {
            username = this.facilityToUser.get(current.parent._id)!;
            break;
          }
          current = current.parent;
        }
      }
      
      if (username) {
        if (!this.reportsByUser.has(username)) {
          this.reportsByUser.set(username, []);
        }
        this.reportsByUser.get(username)!.push(report);
      }
    }

    this.savedCount += reportsToSave.length;    
    return reportsToSave;
  }

  async flush(): Promise<void> {
    if (!this.saveDir || this.reportsByUser.size === 0) {
      return;
    }
    if (!existsSync(this.saveDir)) {
      await mkdir(this.saveDir, { recursive: true });
    }

    for (const [username, reports] of this.reportsByUser.entries()) {
      const outputPath = join(this.saveDir, `${username}-reports.json`);
      await writeFile(outputPath, JSON.stringify(reports, null, 2));
    }

    const summary = {
      total_reports: this.savedCount,
      total_users: this.reportsByUser.size,
      average_reports_per_user: Math.round(this.savedCount / this.reportsByUser.size),
      percentage_saved: this.percentage,
      generated_at: new Date().toISOString(),
      users: Array.from(this.reportsByUser.entries()).map(([username, reports]) => ({
        username,
        report_count: reports.length
      }))
    };
    
    const summaryPath = join(this.saveDir, 'summary.json');
    await writeFile(summaryPath, JSON.stringify(summary, null, 2));
  }
}

export default ReportsSaver;

