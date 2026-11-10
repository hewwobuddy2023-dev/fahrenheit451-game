# Actual human playtest record

**Current recorded human tests: 0.** Automated simulations do not count. Complete this form separately with two other actual people. Do not fill it using invented answers. Aliases are enough; avoid publishing classmates’ personal information.

## Tester 1

- Alias:
- Date:
- Device / browser / school Wi-Fi or other network:
- Reviewed build commit / URL:
- Start and finish time / duration:
- Normal campaign or Presentation Mode:
- Last challenge reached / journal count:
- Ending viewed:
- Could they start without help?
- One confusing instruction, in their words:
- One bug / reproduction steps:
- What did they think the game said about the novel’s theme?
- Did the ending make sense?
- Changes made afterward / commit:
- Retest result:

## Tester 2

- Alias:
- Date:
- Device / browser / school Wi-Fi or other network:
- Reviewed build commit / URL:
- Start and finish time / duration:
- Normal campaign or Presentation Mode:
- Last challenge reached / journal count:
- Ending viewed:
- Could they start without help?
- One confusing instruction, in their words:
- One bug / reproduction steps:
- What did they think the game said about the novel’s theme?
- Did the ending make sense?
- Changes made afterward / commit:
- Retest result:

## Owner device checks

### Real iPhone Safari — physical device still unverified
New Game; Continue; Settings & credits, mute and reduced motion; Presentation chapter list and Back; move both directions; hold ACT; tap dialogue; select each response row; open/close journal; pause/resume/quit; Hound miss/retry; two-finger river dive; all three endings; title return. Rotate portrait → landscape and collapse/expand Safari toolbars. Check notched safe areas and accidental page scrolling. Record the exact iPhone/iOS version and commit.

### School Chromebook — currently unverified
Cold-load Pages on actual school Wi-Fi. Record model, Chrome version, viewport and FPS with `?debug`, then `?debug&lowres`. Sample the burn, parlor, boulevard, river and camp for at least 30 seconds each, and one scene for five minutes. Note lowest sustained FPS and readable UI. Confirm keyboard, reload/Continue, timer fairness, and a timed 3–5-minute rehearsal.


## Day 2 acceptance additions

For each tester, record whether the first objective made sense without help, whether the footsteps/cues were quiet enough, whether mute stayed selected after returning to title, and whether reduced motion helped. Switch tabs during an escape or conversation, wait at least ten seconds, and return. Verify the curtain pauses play and the return gesture does not also advance dialogue.

For a phone failure, append `?diagnostics` to the reviewed build URL (or `&diagnostics` if a query already exists). Capture the local panel showing viewport, canvas rectangle, DOM events, Phaser downs, active scene/input and recent errors. Note the commit, iOS/browser version, orientation and whether the game is in Safari or an in-app browser. This panel transmits nothing. The old live site does not contain these new diagnostics until a release is explicitly approved.

For audio acceptance: fresh visit starts silently until interaction; sound begins after the first gesture; M or the menu mutes; room changes do not stack loops; no sound continues after locking/backgrounding; the return gesture restores normal sound if unmuted. Repeat with the phone's silent switch and media volume recorded. Do not treat Linux WebKit as a physical iPhone test.
