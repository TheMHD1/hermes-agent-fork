import { describe, expect, it } from 'vitest'
import { caduceus, logo, parseRichMarkup } from '../banner'

const palette = {
  gold: '#FFD700',
  amber: '#FFBF00',
  bronze: '#CD7F32',
  dim: '#B8860B',
}

// Source of truth: hermes_cli/banner.py HERMES_AGENT_LOGO / HERMES_CADUCEUS.
// Do not "simplify" these — the TUI banner must render identically to the
// base CLI (`hermes` without `--tui`). Changing this requires also changing
// hermes_cli/banner.py so both stay in sync.

describe('banner parity with hermes_cli/banner.py', () => {
  it('logo: first two rows are bold gold, rest plain (amber, bronze)', () => {
    const lines = logo(palette)
    expect(lines).toHaveLength(6)

    // [bold #FFD700]
    expect(lines[0]![0]).toBe('#FFD700')
    expect(lines[0]![2]?.bold).toBe(true)
    expect(lines[1]![0]).toBe('#FFD700')
    expect(lines[1]![2]?.bold).toBe(true)

    // [#FFBF00] — NOT bold
    expect(lines[2]![0]).toBe('#FFBF00')
    expect(lines[2]![2]?.bold).toBe(false)
    expect(lines[3]![0]).toBe('#FFBF00')
    expect(lines[3]![2]?.bold).toBe(false)

    // [#CD7F32] — NOT bold
    expect(lines[4]![0]).toBe('#CD7F32')
    expect(lines[4]![2]?.bold).toBe(false)
    expect(lines[5]![0]).toBe('#CD7F32')
    expect(lines[5]![2]?.bold).toBe(false)
  })

  it('caduceus: zero bold rows, gradient matches base CLI', () => {
    const lines = caduceus(palette)
    expect(lines).toHaveLength(15)

    // base CLI gradient: bronze, bronze, amber, amber, gold, gold, amber, amber,
    //                   bronze, bronze, dim, dim, dim, dim, dim
    const expectedColors = [
      '#CD7F32', '#CD7F32', '#FFBF00', '#FFBF00', '#FFD700', '#FFD700',
      '#FFBF00', '#FFBF00', '#CD7F32', '#CD7F32',
      '#B8860B', '#B8860B', '#B8860B', '#B8860B', '#B8860B',
    ]
    for (let i = 0; i < lines.length; i++) {
      expect(lines[i]![0]).toBe(expectedColors[i])
      // Base CLI uses no [bold …] on any caduceus row
      expect(lines[i]![2]?.bold).toBe(false)
    }
  })

  it('parseRichMarkup extracts bold attr from [bold #HEX] markup', () => {
    const out = parseRichMarkup('[bold #FFD700]HELLO[/]')
    expect(out).toHaveLength(1)
    expect(out[0]![0]).toBe('#FFD700')
    expect(out[0]![1]).toBe('HELLO')
    expect(out[0]![2]?.bold).toBe(true)
  })

  it('parseRichMarkup leaves non-bold markup unbolded', () => {
    const out = parseRichMarkup('[#FFBF00]HELLO[/]')
    expect(out[0]![0]).toBe('#FFBF00')
    expect(out[0]![2]?.bold).toBe(false)
  })
})
