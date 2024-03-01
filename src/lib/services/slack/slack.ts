import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import puppeteer, { Page } from "puppeteer";
import { SELECTORS } from "./selectors";
import { DOWNLOAD_PATH } from "src/lib/utils/picture";

const rl = createInterface({
  input: stdin,
  output: stdout,
});

const workspace =
  import.meta.env.VITE_SLACK_WORKSPACE ?? (await rl.question("Workspace: "));
const email =
  import.meta.env.VITE_SLACK_EMAIL ?? (await rl.question("Email: "));
const password =
  import.meta.env.VITE_SLACK_PASSWORD ?? (await rl.question("Password: "));

const URL_SIGN_IN = `https://${workspace}/sign_in_with_password`;

rl.close();

const openSlack = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const pages = await browser.pages();
  const page = pages[0];

  await page.goto(URL_SIGN_IN);
  return page;
};

const signIn = async (page: Page) => {
  await page.waitForSelector(SELECTORS.INPUT_EMAIL);
  await page.type(SELECTORS.INPUT_EMAIL, email);
  await page.type(SELECTORS.INPUT_PASSWORD, password);

  await page.keyboard.press("Enter");
};

const updateStatus = async (page: Page, status: string) => {
  await page.waitForSelector(SELECTORS.BUTTON_USER_PROFILE);
  await page.click(SELECTORS.BUTTON_USER_PROFILE);

  await page.waitForSelector(SELECTORS.BUTTON_UPDATE_STATUS);
  await page.click(SELECTORS.BUTTON_UPDATE_STATUS);

  await page.waitForSelector(SELECTORS.BUTTON_EMOJI_PICKER);
  await page.click(SELECTORS.BUTTON_EMOJI_PICKER);
  await page.click(SELECTORS.EMOJI_MUSICAL_NOTE);

  await page.waitForSelector(SELECTORS.INPUT_STATUS);
  await page.click(SELECTORS.INPUT_STATUS);

  await page.keyboard.down("Control");
  await page.keyboard.down("a");

  await page.keyboard.press("Backspace");

  await page.keyboard.up("Control");
  await page.keyboard.up("a");

  await page.keyboard.type(status);

  await page.click(SELECTORS.INPUT_DURATION);
  await page.click(SELECTORS.OPTION_NO_CLEAR);

  await page.click(SELECTORS.BUTTON_SUBMIT_STATUS);
};

const updateProfilePic = async (page: Page) => {
  await page.waitForSelector(SELECTORS.BUTTON_USER_PROFILE);
  await page.click(SELECTORS.BUTTON_USER_PROFILE);

  await page.waitForSelector(".c-menu_item__label");
  await page.evaluateHandle(() => {
    const button = Array.from(
      document.querySelectorAll(".c-menu_item__label")
    ).find((element) => (element as HTMLElement).innerText === "Profile") as
      | HTMLButtonElement
      | undefined;

    button?.click();
  });

  await page.waitForSelector(".p-r_member_profile__name__edit");
  await page.click(".p-r_member_profile__name__edit");

  const input = await page.waitForSelector("input.hidden");
  input?.uploadFile(DOWNLOAD_PATH);

  await page.waitForSelector('[data-qa="edit_profile_upload_save_button"]');
  await page.click('[data-qa="edit_profile_upload_save_button"]');

  await page.waitForSelector("#real_name-input");
  await page.evaluateHandle(() => {
    const button = Array.from(
      document.querySelectorAll(".c-button--primary")
    ).find(
      (element) => (element as HTMLElement).innerText === "Save Changes"
    ) as HTMLButtonElement | undefined;

    button?.click();
  });
};

export const slack = {
  openSlack,
  signIn,
  updateStatus,
  updateProfilePic,
};
