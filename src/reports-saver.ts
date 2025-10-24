import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Doc, DocType } from './doc-design.js';

class ReportsSaver {
  private saveDir: string | undefined;
  private percentage: number;
  private savedCount = 0;
  private reportsByUser: Map<string, Doc[]> = new Map();
  private facilityToUser: Map<string, string> = new Map(); // Maps facility_id to username
  private currentUser: string | null = null;

  constructor(saveDir: string | undefined, percentage: number) {
    this.saveDir = saveDir;
    this.percentage = percentage;
  }

  async saveReports(docs: Doc[]): Promise<Doc[]> {
    if (!this.saveDir) {
      return [];
    }

    // Track user-facility mapping (CHW creates user-settings with facility_id)
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

    // Assign reports to users based on facility hierarchy
    for (const report of reportsToSave) {
      let username = this.currentUser; // Default to current user
      
      // Try to find user from report's contact hierarchy
      if ('contact' in report && report.contact && typeof report.contact === 'object') {
        const contact: any = report.contact;
        // Navigate up the hierarchy to find the clinic (which has the facility_id)
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

    // Write individual user report files
    for (const [username, reports] of this.reportsByUser.entries()) {
      const outputPath = join(this.saveDir, `${username}-reports.json`);
      await writeFile(outputPath, JSON.stringify(reports, null, 2));
      console.info(`   👤 ${username}: ${reports.length} reports → ${outputPath}`);
    }

    // Write summary
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
    
    console.info(`\n📄 Saved ${this.savedCount} reports (${this.percentage}%) for ${this.reportsByUser.size} users`);
    console.info(`   Average: ${summary.average_reports_per_user} reports per user`);
    console.info(`   Output directory: ${this.saveDir}`);
    console.info(`   Summary: ${summaryPath}`);
  }
}

export default ReportsSaver;

