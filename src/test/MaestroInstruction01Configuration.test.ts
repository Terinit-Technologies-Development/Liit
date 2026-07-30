declare const require: (moduleName: string) => any;
const fs = require('fs');
const path = require('path');

const root = process.cwd();

describe('Instruction 1 Maestro configuration', () => {
  const read = (relativePath: string) =>
    fs.readFileSync(path.join(root, relativePath), 'utf8');

  it('contains two top-level Instruction 1 journeys', () => {
    expect(
      fs.existsSync(path.join(root, '.maestro/instruction-01-main.yaml'))
    ).toBe(true);

    expect(
      fs.existsSync(path.join(root, '.maestro/instruction-01-signout.yaml'))
    ).toBe(true);
  });

  it('tests mode cancellation through the Profile product flow', () => {
    const flow = read('.maestro/instruction-01-main.yaml');

    expect(flow).toContain('id: "profile-open-mode-switch"');
    expect(flow).toContain('id: "mode-cancel"');

    const prototypeControlsIndex = flow.indexOf(
      'tapOn: "Open Prototype Controls"'
    );
    const cancelIndex = flow.indexOf('id: "mode-cancel"');

    // Cancellation must happen before Prototype Controls is opened.
    expect(cancelIndex).toBeGreaterThan(-1);
    expect(prototypeControlsIndex).toBeGreaterThan(cancelIndex);
  });

  it('does not try to open Prototype Controls after sign-out', () => {
    const flow = read('.maestro/instruction-01-signout.yaml');

    expect(flow).toContain('tapOn: "Sign Out"');
    expect(flow).not.toContain('tapOn: "Open Prototype Controls"');
  });

  it('does not clear state during the durable relaunch check', () => {
    const flow = read('.maestro/instruction-01-signout.yaml');

    const signOutIndex = flow.indexOf('tapOn: "Sign Out"');
    const relaunchSection = flow.slice(signOutIndex);

    expect(relaunchSection).toContain('- stopApp');
    expect(relaunchSection).toContain('- launchApp');
    expect(relaunchSection).not.toContain('clearState: true');
  });
});
