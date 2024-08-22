export default [
  {
    id: 1,
    dated: "May 18, 2020",
    title: "Copy Assets and bug Fixes",
    description: "Added ability for a assets to be duplicated across playgrounds and from different agencies. Fixed bug while Adding Asset.",
    points: []
  },
  {
    id: 2,
    dated: "May 25, 2020",
    title: "Maintenance Item Media",
    description: "Added ability for a maintenance item in a high frequency inspection to have pictures assigned to it.",
    points: []
  },
  {
    id: 3,
    dated: "Jun 6, 2020",
    title: "Change Log, picture timestamp and data reset",
    description: "Today marks the beginning of the change log built in to the mobile app. Every change/update made will have an entry with a notice informing users of new features, fixes, or changes to the app. Backdate adding entries as well. Today's changes include:",
    points: [
      "Change Log Started",
      "Pictures taken are logged with date/time",
      "Added mobile force pull from server keeping data in sync"
    ]
  },
  {
    id: 4,
    dated: "Jun 8, 2020",
    title: "Before/After Image Capture",
    description: "Added Arrival (Before inspection) and Departure (After Inspection) picture capturing.",
    points: [
      "Added Arrival and Departure Inspection Sections",
      "Pictures taken are logged with date/time",
      "Departure shows pictures side-by-side",
      "If an arrival picture is taken, it will not allow inspection to be marked as complete until corresponding departure image is taken"
    ]
  },
  {
    id: 5,
    dated: "Jun 26, 2020",
    title: "Multiple Findings per Asset",
    description: "Mobile app now supports multiple findings per asset to match actual usage.",
    points: []
  },
  {
    id: 6,
    dated: "Sep 20, 2020",
    title: "Added Quick Inspection",
    description: "Supports quick inspection type and other bug fixes.",
    points: [
      "Added dynamic inspection loading types (High Freq, Quick) to Inspection type during Inspection Add",
      "Quick Inspection collects only an image and note at a time",
      "Fixed Inspection Add drop-downs sort bug",
      "Fixed inspection list sort bug"
    ]
  },
  {
    id: 7,
    dated: "Dec 16, 2020",
    title: "Changed Asset Sort",
    description: "Assets are now sorted as 1, 2, 10 vs 1, 10, 2. 1-1,1-2,1-10 supported as well.",
    points: [
      "Prepped mobile application database for asset deletion",
      "Prepped mobile application database for inspection archive and deletion",
    ]
  },
  {
    id: 8,
    dated: "Dec 16, 2020",
    title: "Text Box Comments covered by Keyboard",
    description: "Fixed Text Box Comments covered by Keyboard bug on inspections, agencies, playgrounds, and inspections.",
    points: []
  },
  {
    id: 9,
    dated: "Dec 17, 2020",
    title: "HFI mark remaining compliant with no comments on last page button",
    description: "On the High Frequency Report page there is a Mark Remaining Compliant with no notes when there are items that have not been marked. You are able to go back and review.",
    points: []
  },
  {
    id: 10,
    dated: "Dec 19, 2020",
    title: "Bug Fixes and Enhancements",
    description: "General Bug fixes and Enhancements",
    points: [
      "Fixed bug with Dropdown throwing method not found error",
      "Fixed Image memory leak if image not fully downloaded and navigate away",
      "Modified database for future changes",
      "Added High Frequency Arrival and Departure image deletion/replacement (Long press on image)",
      "Does not display deleted or archived data once synced and refreshed.",
      "Added Quick Inspection image delete/replacement (Long press on image)",
      "Fixed read only bug in inspections."
    ]
  },
  {
    id: 11,
    dated: "Dec 21, 2020",
    title: "Bug Fixes and Enhancements",
    description: "Dropdown Fix",
    points: [
      "Fixed bug with Dropdown not populating data",
    ]
  },
  {
    id: 12,
    dated: "Feb 27, 2021",
    title: "Bug Fixes and Enhancements",
    description: "Media Sync",
    points: [
      "Fixed bug with Media Sync not showing status if media still present",
    ]
  },
  {
    id: 13,
    dated: "Mar 19, 2021",
    title: "Enhancements",
    description: "Features by request",
    points: [
      "Enabled gallery picker for photos",
      "Added Long press to inspection list items for menu",
    ]
  },
  {
    id: 14,
    dated: "Jun 7, 2021",
    title: "Bug Fixes and Enhancements",
    description: "",
    points: [
      "Added additional error capturing notifications",
      "Fixed bug with adding image to asset navigating to inspections list",
      "Added single tap for initial asset adding image selection menu",
      "Updated file upload timeout to 45 seconds",
    ]
  },
  {
    id: 15,
    dated: "Aug 9, 2021",
    title: "System Updates and Icons",
    description: "",
    points: [
      "Incremented system version",
      "Changed Icon size to 24px from 16px"
    ]
  },
  {
    id: 16,
    dated: "Oct 18, 2021",
    title: "Bug Fixes and Enhancements",
    description: "",
    points: [
      "Fixed add additional Mx Image bug",
      "Fixed Re-sync pull data shorting load duration",
      "Added sync percentage indicator",
    ]
  },
  {
    id: 17,
    dated: "Feb 24, 2022",
    title: "Mx Image Delete",
    description: "",
    points: [
      "Added Mx Item Delete",
      "Added Arrival and After Inspection ima ge replace / delete",
    ]
  },
  {
    id: 18,
    dated: "Feb 15, 2024",
    title: "Image Import Bug Time Bug",
    description: "",
    points: [
      "Fixed bug with image import from photo library not recording time"
    ]
  },
  {
    id: 19,
    dated: "Apr 21, 2024",
    title: "Quick Pick Reference Lookup",
    description: "Added ability to lookup ASTM references for quick pick based on category. This change applies to most comments or notes text fields and appends the verbiage to the end of what is existing in the text field.",
    points: []
  }
]