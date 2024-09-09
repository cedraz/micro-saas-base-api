import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  constructor(private readonly configService: ConfigService) {}

  async getAuthSheets() {
    const clientEmail = this.configService.get<string>('GOOGLE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('GOOGLE_PRIVATE_KEY')
      .replace(/\\n/g, '\n');
    const projectId = this.configService.get<string>('GOOGLE_PROJECT_ID');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId: projectId,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const spreadsheetId = this.configService.get<string>(
      'GOOGLE_SPREADSHEET_ID',
    );

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: client as any });

    return {
      auth,
      client,
      googleSheets,
      spreadsheetId,
    };
  }
}
