import { Button } from "../../ui/button";
import { Dialog } from "../../ui/dialog";
import { createSignal, Show } from "solid-js";
import { IconHome } from "../../ui/svg/icons";
import { Navigate } from "@solidjs/router";
import { useTheme } from "../../components/context-theme";
import styles from "./design.module.css";

export default function DesignSystem() {
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

      <section>
        <h2 class={styles.sectionTitle}>Dialogs</h2>

        <table class={styles.componentTable}>
          <tbody>
            <tr>
              <td class={styles.componentCell}>
                <h3 class={styles.componentLabel}>Default Dialog</h3>
                <Button onClick={() => setDialogOpen(true)}>Open Dialog</Button>
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
                <h3 class={styles.componentLabel}>Small Dialog</h3>
                <Button color="secondary" onClick={() => {
                  setDialogOpenTransition(true);
                }}>Open Small Dialog</Button>
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
