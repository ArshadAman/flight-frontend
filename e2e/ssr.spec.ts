import { test, expect } from "@playwright/test";

test.describe("Post-Booking SSR & Seat Selection E2E Flow", () => {
  const MOCK_TICKET_ID = "31241-mock-ticket-12345";
  const BASE_URL = process.env.FRONTEND_URL || "http://localhost:3001";

  test("should load booking details, open SSR selector, make selections, and persist them on reload (Mock Mode)", async ({ page }) => {
    // Pre-populate offline_bookings in localStorage so that ticket loads and persists on reload
    await page.addInitScript(() => {
      if (!localStorage.getItem("offline_bookings")) {
        const mockTicket = {
          id: "31241-mock-ticket-12345",
          status: "CONFIRMED",
          pnr_number: "XYR9NF",
          ticket_number: "079176412201",
          basic_amount: 12000,
          tax_amount: 0,
          total_amount: 12000,
          passengers_data: [
            { first_name: "HARSHIT", last_name: "CHIRGANIA", title: "MR", pax_type: 0 },
            { first_name: "VAIBHAV", last_name: "ARORA", title: "MR", pax_type: 0 }
          ],
          segments_data: [
            {
              segment_id: 0,
              origin: "DEL",
              destination: "BOM",
              flight_number: "2014",
              airline_code: "AI",
              airline_name: "Air India",
              departure_datetime: new Date().toISOString(),
              return_flight: false
            }
          ]
        };
        localStorage.setItem("offline_bookings", JSON.stringify([mockTicket]));
      }
    });

    // 1. Navigate directly to the booking details page using the mock ticket ID
    await page.goto(`${BASE_URL}/my-booking/${MOCK_TICKET_ID}`);

    // Verify booking header elements and typography matching "Outfit" flight booking theme
    const heading = page.locator("h1").filter({ hasText: "My booking" }).first();
    await expect(heading).toHaveText("My booking");
    await expect(heading).toHaveCSS("font-family", /Outfit|sans-serif/);

    // Verify barcode rendering in PassengerMoreDetails component
    const barcode1 = page.locator("svg#barcode-1").first();
    const barcode2 = page.locator("svg#barcode-2").first();
    await expect(barcode1).toBeVisible();
    await expect(barcode2).toBeVisible();
    // Verify that the SVGs are successfully generated and drawn by checking the width attribute
    await expect(barcode1).toHaveAttribute("width");
    await expect(barcode2).toHaveAttribute("width");

    // Verify barcode visibility under print media emulation
    await page.emulateMedia({ media: "print" });
    await expect(barcode1).toBeVisible();
    await expect(barcode2).toBeVisible();
    await expect(barcode1).toHaveAttribute("width");
    await expect(barcode2).toHaveAttribute("width");
    // Revert back to screen media
    await page.emulateMedia({ media: "screen" });

    // 2. Click the SSR Selection Accordion Header ("Seats & Special Service Requests (SSR)")
    const ssrAccordionButton = page.locator("button:has-text('Seats & Special Service Requests (SSR)')").first();
    await expect(ssrAccordionButton).toBeVisible();
    await ssrAccordionButton.click();

    // Verify that the accordion content opens and displays tabs
    const seatSelectionTab = page.locator("button:has-text('Seat Selection')").first();
    await expect(seatSelectionTab).toBeVisible();

    // 3. Interact with the Seat Selection Tab
    // Verify seat map container is loaded
    const frontAircraftLabel = page.locator("text=✈️ Front of Aircraft").first();
    await expect(frontAircraftLabel).toBeVisible();

    // Select Seat '1B' (Premium Seat) for Passenger 1
    const seat1BButton = page.locator("button[title*='1B']").first();
    await expect(seat1BButton).toBeVisible();
    await seat1BButton.click();

    // Verify that Seat '1B' displays selected state (rose-600 background color)
    await expect(seat1BButton).toHaveClass(/bg-rose-600/);

    // Verify that price calculation updates dynamically in the summary panel
    const additionsSummary = page.locator("span:has-text('+₹')").first();
    await expect(additionsSummary).toBeVisible();
    
    // 4. Switch to Meals Selection Tab
    const mealsTabButton = page.locator("button:has-text('Meals Selection')").first();
    await mealsTabButton.click();

    // Select "Vegetarian Hot Meal" for Passenger 1
    const passenger1MealSelect = page.locator("select").first();
    await passenger1MealSelect.selectOption({ label: "Vegetarian Hot Meal (+₹250)" });

    // 5. Switch to Assistance & Baggage Tab
    const assistanceTabButton = page.locator("button:has-text('Assistance & Baggage')").first();
    await assistanceTabButton.click();

    // Select "Prepaid Excess Baggage 5kg" for Passenger 1
    const passenger1BaggageSelect = page.locator("select").first();
    await passenger1BaggageSelect.selectOption({ label: "Prepaid Excess Baggage 5kg (+₹1,900)" });

    // Select "Wheelchair Assistance" for Passenger 1
    const passenger1AssistanceSelect = page.locator("select").nth(1);
    await passenger1AssistanceSelect.selectOption({ label: "Wheelchair Assistance (Complimentary)" });

    // 6. Verify total price updates dynamically in the sidebar panel
    const totalPriceLabel = page.locator("span:has-text('₹')").last();
    // Base amount is 12,000. Additions: Seat (699) + Meal (250) + Baggage (1900) + Wheelchair (0) = 2,849. Total = 14,849
    await expect(totalPriceLabel).toContainText("14,849");

    // 7. Click "Confirm & Add SSR Choices" button
    const confirmButton = page.locator("button:has-text('Confirm & Add SSR Choices')").first();
    await confirmButton.click();

    // Verify loading state is shown and success screen is visible
    const successHeader = page.locator("h4:has-text('SSRs Added Successfully!')").first();
    await expect(successHeader).toBeVisible();

    // 8. Reload page to verify persistence in localStorage
    await page.reload();

    // Re-verify that SSR selection is persisted and displayed on page render
    // Re-open accordion
    await ssrAccordionButton.click();
    
    // Check selections summary contains the added items
    const summaryPanel = page.locator("h4:has-text('Summary of Selections')").first();
    await expect(summaryPanel).toBeVisible();
    
    // Confirm 1B seat is selected
    const persistedSeat1B = page.locator("button[title*='1B']").first();
    await expect(persistedSeat1B).toHaveClass(/bg-rose-600/);
  });
});
