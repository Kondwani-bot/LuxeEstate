import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, spreadsheetId, type, name, email, phone, propertyId, propertyTitle, message } = await req.json();

    const timestamp = new Date().toLocaleString();
    const rowData = [timestamp, type, name || "N/A", email || "N/A", phone || "N/A", propertyId || "N/A", propertyTitle || "N/A", message || ""];

    // Fallback if no OAuth token is provided
    if (!accessToken) {
      console.log("Mocking Google Sheets append for rows:", rowData);
      return NextResponse.json({
        success: true,
        mode: "offline",
        message: "Logged successfully to Virtual Sheet (Connect Google account for actual Sheet sync)",
        row: rowData,
        spreadsheetId: "virtual-luxeestate-leads-sheet-id"
      });
    }

    let targetSpreadsheetId = spreadsheetId;

    // Step 1: If no spreadsheet ID exists, create a new one automatically
    if (!targetSpreadsheetId) {
      try {
        const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            properties: {
              title: "LuxeEstate - Exclusive AI Leads & Bookings"
            }
          })
        });

        if (!createRes.ok) {
          const errMsg = await createRes.text();
          throw new Error(`Failed to create spreadsheet: ${errMsg}`);
        }

        const newSheet = await createRes.json();
        targetSpreadsheetId = newSheet.spreadsheetId;

        // Step 2: Initialize headers
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}/values/Sheet1!A1:H1?valueInputOption=USER_ENTERED`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            values: [
              ["Timestamp", "Type", "Client Name", "Client Email", "Client Phone", "Property ID", "Property Title", "Message / Preferred Session"]
            ]
          })
        });

      } catch (createErr: any) {
        console.error("Error creating Google Sheet automatically:", createErr);
        // Fallback to appending to general list or throw
        return NextResponse.json({
          success: false,
          error: `Spreadsheet creation failed: ${createErr.message}`
        }, { status: 500 });
      }
    }

    // Step 3: Append the data row
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          values: [rowData]
        })
      }
    );

    if (!appendRes.ok) {
      const appendError = await appendRes.text();
      console.error("Google sheets append error details:", appendError);
      return NextResponse.json({
        success: false,
        error: `Failed to append row: ${appendError}`
      }, { status: appendRes.status });
    }

    return NextResponse.json({
      success: true,
      mode: "live",
      spreadsheetId: targetSpreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSpreadsheetId}`,
      row: rowData
    });

  } catch (error: any) {
    console.error("Sheets log endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
