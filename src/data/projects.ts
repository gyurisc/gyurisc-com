export interface Project {
  name: string;
  description: string;
  href: string;
  /** Optional short label shown next to the name, e.g. "Consulting". */
  label?: string;
}

/**
 * Links to my own projects carry ?ref=gyurisc.com so their analytics can
 * attribute the visit to this site.
 */
export const PROJECTS: Project[] = [
  {
    name: "Adriatic Atlas",
    description:
      "Croatian beach guide: sand, water quality, facilities and crowd levels for 59 Adriatic beaches. Built from thousands of real visitor reviews.",
    href: "https://adriaticatlas.com/?ref=gyurisc.com",
  },
  {
    name: "WedpicsQR",
    description:
      "Wedding photo sharing with a QR code. Guests scan, upload and see the whole day's photos without installing an app.",
    href: "https://www.wedpicsqr.com/?ref=gyurisc.com",
  },
  {
    name: "BumpCalc",
    description:
      "Free pregnancy calculators: due date, week tracker, ovulation, baby growth and more. All client-side, no signup needed.",
    href: "https://www.bumpcalc.com/?ref=gyurisc.com",
  },
  {
    name: "Könyvkalkulátor",
    description:
      "A simple reading speed calculator, in Hungarian. Work out how many books you'll actually finish this year.",
    href: "https://www.konyvkalkulator.com/?ref=gyurisc.com",
  },
  {
    name: "PomTask",
    description:
      "A pomodoro timer and todo list in one, for getting things done without switching between two apps.",
    href: "https://pomtask.com/?ref=gyurisc.com",
  },
  {
    name: "Write",
    description:
      "A plain writing page with word and character count. Built it for myself to keep a morning writing habit going.",
    href: "https://write.gyurisc.com/?ref=gyurisc.com",
  },
  {
    name: "Inbox Genie",
    description:
      "Helps you write professional emails, delivered straight to your inbox.",
    href: "https://www.inboxgenie.io/?ref=gyurisc.com",
  },
  {
    name: "Why Not Start Today",
    description:
      "A simple starting page to help fellow indie hackers stay motivated and keep creating.",
    href: "https://www.whynotstarttoday.com/?ref=gyurisc.com",
  },
  {
    name: "Kadabra Labs",
    label: "Consulting",
    description: "My consulting company, working on AI workflow automation.",
    href: "https://www.kadabra-labs.com/?ref=gyurisc.com",
  },
  {
    name: "gyurisc.com",
    label: "This site",
    description: "My personal blog, projects and thoughts.",
    href: "/",
  },
];
