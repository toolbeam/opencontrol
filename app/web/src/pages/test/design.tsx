import { Button } from "../../ui/button";
import { Dialog } from "../../ui/dialog";
import { Navigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { IconHome } from "../../ui/svg/icons";
import { useTheme } from "../../components/context-theme";
import { useDialog } from "../../ui/context-dialog"
import { DialogString } from "../../ui/dialog-string"
import styles from "./design.module.css";

export default function DesignSystem() {
  const dialog = useDialog()
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [dialogOpenTransition, setDialogOpenTransition] = createSignal(false);
  const theme = useTheme();

  // Check if we're running locally
  const isLocal = import.meta.env.DEV === true;

  if (!isLocal) {
    return <Navigate href="/" />;
  }

  // Add a toggle button for theme
  const toggleTheme = () => {
    theme.setMode(theme.mode === "light" ? "dark" : "light");
  };

  return (
    <div class={styles.pageContainer}>
      <div class={styles.header}>
        <h1 style={{ "font-size": "var(--heading-font-size, 2rem)", "text-transform": "uppercase", "font-weight": "600" }}>Design System</h1>
        <Button onClick={toggleTheme}>
          Toggle {theme.mode === "light" ? "Dark" : "Light"} Mode
        </Button>
      </div>

      <section class={styles.colorSection}>
        <h2 class={styles.sectionTitle}>Colors</h2>
        
        <table class={styles.componentTable}>
          <tbody>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Orange</h3>
                <div class={styles.colorBox} style={{ "background-color": "var(--color-orange)" }}>
                  <span class={styles.colorCode}>hsl(41, 82%, 63%)</span>
                </div>
                <div class={styles.colorVariants}>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-orange-low)" }}>
                    <span class={styles.colorVariantCode}>hsl(41, 39%, 22%)</span>
                  </div>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-orange-high)" }}>
                    <span class={styles.colorVariantCode}>hsl(41, 82%, 87%)</span>
                  </div>
                </div>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Green</h3>
                <div class={styles.colorBox} style={{ "background-color": "var(--color-green)" }}>
                  <span class={styles.colorCode}>hsl(101, 82%, 63%)</span>
                </div>
                <div class={styles.colorVariants}>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-green-low)" }}>
                    <span class={styles.colorVariantCode}>hsl(101, 39%, 22%)</span>
                  </div>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-green-high)" }}>
                    <span class={styles.colorVariantCode}>hsl(101, 82%, 80%)</span>
                  </div>
                </div>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Blue</h3>
                <div class={styles.colorBox} style={{ "background-color": "var(--color-blue)" }}>
                  <span class={styles.colorCode}>hsl(234, 100%, 60%)</span>
                </div>
                <div class={styles.colorVariants}>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-blue-low)" }}>
                    <span class={styles.colorVariantCode}>hsl(234, 54%, 20%)</span>
                  </div>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-blue-high)" }}>
                    <span class={styles.colorVariantCode}>hsl(234, 100%, 87%)</span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Purple</h3>
                <div class={styles.colorBox} style={{ "background-color": "var(--color-purple)" }}>
                  <span class={styles.colorCode}>hsl(281, 82%, 63%)</span>
                </div>
                <div class={styles.colorVariants}>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-purple-low)" }}>
                    <span class={styles.colorVariantCode}>hsl(281, 39%, 22%)</span>
                  </div>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-purple-high)" }}>
                    <span class={styles.colorVariantCode}>hsl(281, 82%, 89%)</span>
                  </div>
                </div>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Red</h3>
                <div class={styles.colorBox} style={{ "background-color": "var(--color-red)" }}>
                  <span class={styles.colorCode}>hsl(339, 82%, 63%)</span>
                </div>
                <div class={styles.colorVariants}>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-red-low)" }}>
                    <span class={styles.colorVariantCode}>hsl(339, 39%, 22%)</span>
                  </div>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-red-high)" }}>
                    <span class={styles.colorVariantCode}>hsl(339, 82%, 87%)</span>
                  </div>
                </div>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Accent</h3>
                <div class={styles.colorBox} style={{ "background-color": "var(--color-accent)" }}>
                  <span class={styles.colorCode}>hsl(13, 88%, 57%)</span>
                </div>
                <div class={styles.colorVariants}>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-accent-low)" }}>
                    <span class={styles.colorVariantCode}>hsl(13, 75%, 30%)</span>
                  </div>
                  <div class={styles.colorVariant} style={{ "background-color": "var(--color-accent-high)" }}>
                    <span class={styles.colorVariantCode}>hsl(13, 100%, 78%)</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class={styles.divider}></div>

      <section class={styles.buttonSection}>
        <h2 class={styles.sectionTitle}>Buttons</h2>

        <table class={styles.componentTable}>
          <tbody>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Primary</h3>
                <Button>Primary Button</Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Secondary</h3>
                <Button color="secondary">Secondary Button</Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Ghost</h3>
                <Button color="ghost">Ghost Button</Button>
              </td>
            </tr>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small</h3>
                <Button size="sm">Small Button</Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small Secondary</h3>
                <Button size="sm" color="secondary">Small Secondary</Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small Ghost</h3>
                <Button size="sm" color="ghost">Small Ghost</Button>
              </td>
            </tr>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>With Icon</h3>
                <Button icon={<IconHome />}>With Icon</Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Icon + Secondary</h3>
                <Button icon={<IconHome />} color="secondary">Icon Secondary</Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Icon + Ghost</h3>
                <Button icon={<IconHome />} color="ghost">Icon Ghost</Button>
              </td>
            </tr>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small + Icon</h3>
                <Button size="sm" icon={<IconHome />}>Small Icon</Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small + Icon + Secondary</h3>
                <Button size="sm" icon={<IconHome />} color="secondary">Small Icon Secondary</Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small + Icon + Ghost</h3>
                <Button size="sm" icon={<IconHome />} color="ghost">Small Icon Ghost</Button>
              </td>
            </tr>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Icon Only</h3>
                <Button icon={<IconHome />}></Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Icon Only + Secondary</h3>
                <Button icon={<IconHome />} color="secondary"></Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Icon Only + Ghost</h3>
                <Button icon={<IconHome />} color="ghost"></Button>
              </td>
            </tr>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small Icon Only</h3>
                <Button size="sm" icon={<IconHome />}></Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small Icon Only + Secondary</h3>
                <Button size="sm" icon={<IconHome />} color="secondary"></Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small Icon Only + Ghost</h3>
                <Button size="sm" icon={<IconHome />} color="ghost"></Button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class={styles.divider}></div>

      <section class={styles.dialogSection}>
        <h2 class={styles.sectionTitle}>Dialogs</h2>

        <table class={styles.componentTable}>
          <tbody>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Default</h3>
                <Button color="secondary" onClick={() => setDialogOpen(true)}>Open Dialog</Button>
                <Dialog open={dialogOpen()} onOpenChange={setDialogOpen}>
                  <div data-slot="header">
                    <div data-slot="title">Dialog Title</div>
                  </div>
                  <div data-slot="main">
                    <p>This is the default dialog content.</p>
                  </div>
                  <div data-slot="footer">
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                  </div>
                </Dialog>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Input String</h3>
                <Button color="secondary" onClick={() =>
                  dialog.open(DialogString, {
                    title: "Name",
                    action: "Change name",
                    placeholder: "Enter a name",
                    onSubmit: () => { }
                  })
                }>
                  Dialog String
                </Button>
              </td>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Small With Transition</h3>
                <Button color="secondary" onClick={() => {
                  setDialogOpenTransition(true);
                }}>Small Dialog</Button>
                <Dialog
                  open={dialogOpenTransition()}
                  onOpenChange={setDialogOpenTransition}
                  size="sm"
                  transition={true}>
                  <div class={styles.dialogContent}>
                    <h2 class={styles.sectionTitle}>Small Dialog</h2>
                    <p>This is a smaller dialog with transitions.</p>
                    <div class={styles.dialogContentFooter}>
                      <Button onClick={() => setDialogOpenTransition(false)}>Close</Button>
                    </div>
                  </div>
                </Dialog>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

    </div>
  );
}
