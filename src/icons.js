import anchorSvg              from '@phosphor-icons/core/assets/regular/anchor.svg?raw';
import globeSvg               from '@phosphor-icons/core/assets/regular/globe.svg?raw';
import textTSvg               from '@phosphor-icons/core/assets/regular/text-t.svg?raw';
import addressBookSvg         from '@phosphor-icons/core/assets/regular/address-book.svg?raw';
import wifiHighSvg            from '@phosphor-icons/core/assets/regular/wifi-high.svg?raw';
import envelopeSvg            from '@phosphor-icons/core/assets/regular/envelope.svg?raw';
import chatCircleTextSvg      from '@phosphor-icons/core/assets/regular/chat-circle-text.svg?raw';
import mapPinSvg              from '@phosphor-icons/core/assets/regular/map-pin.svg?raw';
import crosshairSvg           from '@phosphor-icons/core/assets/regular/crosshair.svg?raw';
import eyeSvg                 from '@phosphor-icons/core/assets/regular/eye.svg?raw';
import boatSvg                from '@phosphor-icons/core/assets/regular/boat.svg?raw';
import swatchesSvg            from '@phosphor-icons/core/assets/regular/swatches.svg?raw';
import squaresFourSvg         from '@phosphor-icons/core/assets/regular/squares-four.svg?raw';
import paletteSvg             from '@phosphor-icons/core/assets/regular/palette.svg?raw';
import cornersOutSvg          from '@phosphor-icons/core/assets/regular/corners-out.svg?raw';
import dotsThreeCircleSvg     from '@phosphor-icons/core/assets/regular/dots-three-circle.svg?raw';
import paintBucketSvg         from '@phosphor-icons/core/assets/regular/paint-bucket.svg?raw';
import imageSvg               from '@phosphor-icons/core/assets/regular/image.svg?raw';
import uploadSimpleSvg        from '@phosphor-icons/core/assets/regular/upload-simple.svg?raw';
import xSvg                   from '@phosphor-icons/core/assets/regular/x.svg?raw';
import frameCornersSvg        from '@phosphor-icons/core/assets/regular/frame-corners.svg?raw';
import downloadSimpleSvg      from '@phosphor-icons/core/assets/regular/download-simple.svg?raw';
import copySvg                from '@phosphor-icons/core/assets/regular/copy.svg?raw';
import arrowCounterClockwiseSvg from '@phosphor-icons/core/assets/regular/arrow-counter-clockwise.svg?raw';
import checkCircleSvg         from '@phosphor-icons/core/assets/regular/check-circle.svg?raw';
import warningCircleSvg       from '@phosphor-icons/core/assets/regular/warning-circle.svg?raw';
import floppyDiskSvg          from '@phosphor-icons/core/assets/regular/floppy-disk.svg?raw';
import trashSvg               from '@phosphor-icons/core/assets/regular/trash.svg?raw';
import tagSvg                 from '@phosphor-icons/core/assets/regular/tag.svg?raw';

const ICONS = {
  'anchor':                anchorSvg,
  'globe':                 globeSvg,
  'text-t':                textTSvg,
  'address-book':          addressBookSvg,
  'wifi-high':             wifiHighSvg,
  'envelope':              envelopeSvg,
  'chat-circle-text':      chatCircleTextSvg,
  'map-pin':               mapPinSvg,
  'crosshair':             crosshairSvg,
  'eye':                   eyeSvg,
  'boat':                  boatSvg,
  'swatches':              swatchesSvg,
  'squares-four':          squaresFourSvg,
  'palette':               paletteSvg,
  'corners-out':           cornersOutSvg,
  'dots-three-circle':     dotsThreeCircleSvg,
  'paint-bucket':          paintBucketSvg,
  'image':                 imageSvg,
  'upload-simple':         uploadSimpleSvg,
  'x':                     xSvg,
  'frame-corners':         frameCornersSvg,
  'download-simple':       downloadSimpleSvg,
  'copy':                  copySvg,
  'arrow-counter-clockwise': arrowCounterClockwiseSvg,
  'check-circle':          checkCircleSvg,
  'warning-circle':        warningCircleSvg,
  'floppy-disk':           floppyDiskSvg,
  'trash':                 trashSvg,
  'tag':                   tagSvg,
};

export function icon(name, size = 20) {
  const raw = ICONS[name];
  if (!raw) return '';
  return raw.replace('<svg ', `<svg width="${size}" height="${size}" `);
}

export function hydrateIcons(root = document.body) {
  for (const name of Object.keys(ICONS)) {
    root.querySelectorAll(`ph-${name}`).forEach((el) => {
      const size = parseInt(el.getAttribute('size') || '20', 10);
      const span = document.createElement('span');
      span.className = 'ph-icon';
      span.innerHTML = icon(name, size);
      el.replaceWith(span);
    });
  }
}
