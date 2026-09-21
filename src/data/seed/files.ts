/*
 * Файлы демо-сида — ассеты этапа 3 из /assets (assets-plan.md §3).
 * Большинство источников — @2x jpg; фото Ивана — подготовленный WebP 4:5.
 * next/image нарезает ширины под размеры экрана.
 */
import type { StaticImageData } from 'next/image'
import type { DirectusFile } from '../types'

import heroDesktop from '@assets/hero/hero-bmw-e34@2x.jpg'
import heroMobile from '@assets/hero/hero-bmw-e34-mobile@2x.jpg'
import directionsParts from '@assets/directions/directions-parts@2x.jpg'
import directionsService from '@assets/directions/directions-service@2x.jpg'
import directionsCustom from '@assets/directions/directions-custom@2x.jpg'
import coverEngine from '@assets/parts/parts-cover-engine@2x.jpg'
import coverTransmission from '@assets/parts/parts-cover-transmission@2x.jpg'
import coverSuspension from '@assets/parts/parts-cover-suspension@2x.jpg'
import coverLighting from '@assets/parts/parts-cover-lighting@2x.jpg'
import coverBody from '@assets/parts/parts-cover-body@2x.jpg'
import coverElectronics from '@assets/parts/parts-cover-electronics@2x.jpg'
import coverInterior from '@assets/parts/parts-cover-interior@2x.jpg'
import counterBg from '@assets/parts/parts-counter-bg@2x.jpg'
import serviceWorkshop from '@assets/service/service-workshop@2x.jpg'
import serviceSwap from '@assets/service/service-work-01-swap-s62-e39@2x.jpg'
import serviceAir from '@assets/service/service-work-02-air-suspension-e70@2x.jpg'
import customBanner from '@assets/custom/custom-banner@2x.jpg'
import customBannerMobile from '@assets/custom/custom-banner-mobile@2x.jpg'
import seatBefore from '@assets/custom/custom-work-07-seat-before.png'
import seatAfter from '@assets/custom/custom-work-07-seat-after.png'
import doorBefore from '@assets/custom/custom-work-08-door-before.png'
import doorAfter from '@assets/custom/custom-work-08-door-after.png'
import pillarWideBefore from '@assets/custom/custom-work-06-pillar-before-wide.png'
import pillarWideAfter from '@assets/custom/custom-work-06-pillar-after-wide.png'
import realWheelReferenceBefore from '@assets/before-after/1a.jpg'
import realWheelReferenceBeforeFront from '@assets/before-after/1b.jpg'
import realWheelReferenceAfter from '@assets/before-after/1a-2.jpg'
import realWheelReferenceAfterFront from '@assets/before-after/1b (2).jpg'
import realPillarReferenceBefore from '@assets/before-after/2b.jpg'
import realPillarReferenceAfter from '@assets/before-after/2a.jpg'
import ivan from '@assets/contacts/gal-at-work@2x.webp'
import ivanAvatar from '@assets/contacts/gal-at-work-avatar@2x.webp'
import posEngine01 from '@assets/parts/positions/engine-01-cylinder-head@2x.jpg'
import posEngine02 from '@assets/parts/positions/engine-02-m62-engine@2x.jpg'
import posEngine03 from '@assets/parts/positions/engine-03-alternator@2x.jpg'
import posEngine04 from '@assets/parts/positions/engine-04-ac-compressor@2x.jpg'
import posEngine05 from '@assets/parts/positions/engine-05-water-pump@2x.jpg'
import posTransmission01 from '@assets/parts/positions/transmission-01-zf-5hp-auto@2x.jpg'
import posTransmission02 from '@assets/parts/positions/transmission-02-getrag-manual@2x.jpg'
import posTransmission03 from '@assets/parts/positions/transmission-03-driveshaft@2x.jpg'
import posTransmission04 from '@assets/parts/positions/transmission-04-rear-differential@2x.jpg'
import posTransmission05 from '@assets/parts/positions/transmission-05-shifter-linkage@2x.jpg'
import posSuspension01 from '@assets/parts/positions/suspension-01-rear-air-strut@2x.jpg'
import posSuspension02 from '@assets/parts/positions/suspension-02-steering-rack@2x.jpg'
import posSuspension03 from '@assets/parts/positions/suspension-03-front-lower-arm@2x.jpg'
import posSuspension04 from '@assets/parts/positions/suspension-04-front-shock@2x.jpg'
import posSuspension05 from '@assets/parts/positions/suspension-05-rear-hub@2x.jpg'
import posLighting01 from '@assets/parts/positions/lighting-01-left-xenon-headlight@2x.jpg'
import posLighting02 from '@assets/parts/positions/lighting-02-angel-eyes-pair@2x.jpg'
import posLighting03 from '@assets/parts/positions/lighting-03-right-tail-light@2x.jpg'
import posLighting04 from '@assets/parts/positions/lighting-04-xenon-ballast@2x.jpg'
import posLighting05 from '@assets/parts/positions/lighting-05-left-fog-light@2x.jpg'
import posBody01 from '@assets/parts/positions/body-01-kidney-grilles@2x.jpg'
import posBody02 from '@assets/parts/positions/body-02-m-front-bumper@2x.jpg'
import posBody03 from '@assets/parts/positions/body-03-hood@2x.jpg'
import posBody04 from '@assets/parts/positions/body-04-left-mirror@2x.jpg'
import posBody05 from '@assets/parts/positions/body-05-trunk-lid@2x.jpg'
import posElectronics01 from '@assets/parts/positions/electronics-01-dme-module@2x.jpg'
import posElectronics02 from '@assets/parts/positions/electronics-02-board-computer@2x.jpg'
import posElectronics03 from '@assets/parts/positions/electronics-03-instrument-cluster@2x.jpg'
import posElectronics04 from '@assets/parts/positions/electronics-04-comfort-module@2x.jpg'
import posElectronics05 from '@assets/parts/positions/electronics-05-front-abs-sensor@2x.jpg'
import posInterior01 from '@assets/parts/positions/interior-01-m-tech-wheel@2x.jpg'
import posInterior02 from '@assets/parts/positions/interior-02-sport-seats@2x.jpg'
import posInterior03 from '@assets/parts/positions/interior-03-dashboard@2x.jpg'
import posInterior04 from '@assets/parts/positions/interior-04-door-cards@2x.jpg'
import posInterior05 from '@assets/parts/positions/interior-05-headliner@2x.jpg'

const file = (id: string, src: StaticImageData, focus?: [number, number]): DirectusFile => ({
  id,
  src,
  width: src.width,
  height: src.height,
  focal_point_x: focus?.[0] ?? null,
  focal_point_y: focus?.[1] ?? null,
})

export const files = {
  heroDesktop: file('hero-bmw-e34', heroDesktop, [0.62, 0.6]),
  heroMobile: file('hero-bmw-e34-mobile', heroMobile, [0.5, 0.6]),
  directionsParts: file('directions-parts', directionsParts),
  directionsService: file('directions-service', directionsService),
  directionsCustom: file('directions-custom', directionsCustom),
  coverEngine: file('parts-cover-engine', coverEngine),
  coverTransmission: file('parts-cover-transmission', coverTransmission),
  coverSuspension: file('parts-cover-suspension', coverSuspension),
  coverLighting: file('parts-cover-lighting', coverLighting),
  coverBody: file('parts-cover-body', coverBody),
  coverElectronics: file('parts-cover-electronics', coverElectronics),
  coverInterior: file('parts-cover-interior', coverInterior),
  counterBg: file('parts-counter-bg', counterBg),
  serviceWorkshop: file('service-workshop', serviceWorkshop),
  serviceSwap: file('service-work-01-swap-s62-e39', serviceSwap),
  serviceAir: file('service-work-02-air-suspension-e70', serviceAir),
  customBanner: file('custom-banner', customBanner, [0.7, 0.5]),
  customBannerMobile: file('custom-banner-mobile', customBannerMobile),
  seatBefore: file('custom-work-07-seat-before', seatBefore),
  seatAfter: file('custom-work-07-seat-after', seatAfter),
  doorBefore: file('custom-work-08-door-before', doorBefore),
  doorAfter: file('custom-work-08-door-after', doorAfter),
  pillarWideBefore: file('custom-work-06-pillar-before-wide', pillarWideBefore),
  pillarWideAfter: file('custom-work-06-pillar-after-wide', pillarWideAfter),
  realWheelReferenceBefore: file('real-wheel-before-reference', realWheelReferenceBefore),
  realWheelReferenceBeforeFront: file('real-wheel-before-front-reference', realWheelReferenceBeforeFront),
  realWheelReferenceAfter: file('real-wheel-after-reference', realWheelReferenceAfter),
  realWheelReferenceAfterFront: file('real-wheel-after-front-reference', realWheelReferenceAfterFront),
  realPillarReferenceBefore: file('real-pillar-before-reference', realPillarReferenceBefore),
  realPillarReferenceAfter: file('real-pillar-after-reference', realPillarReferenceAfter),
  ivan: file('gal-at-work', ivan, [0.5, 0.3]),
  ivanAvatar: file('gal-at-work-avatar', ivanAvatar),
}

export const positionPhotos: Record<string, DirectusFile[]> = {
  engine: [
    file('engine-01-cylinder-head', posEngine01),
    file('engine-02-m62-engine', posEngine02),
    file('engine-03-alternator', posEngine03),
    file('engine-04-ac-compressor', posEngine04),
    file('engine-05-water-pump', posEngine05),
  ],
  transmission: [
    file('transmission-01-zf-5hp-auto', posTransmission01),
    file('transmission-02-getrag-manual', posTransmission02),
    file('transmission-03-driveshaft', posTransmission03),
    file('transmission-04-rear-differential', posTransmission04),
    file('transmission-05-shifter-linkage', posTransmission05),
  ],
  suspension: [
    file('suspension-01-rear-air-strut', posSuspension01),
    file('suspension-02-steering-rack', posSuspension02),
    file('suspension-03-front-lower-arm', posSuspension03),
    file('suspension-04-front-shock', posSuspension04),
    file('suspension-05-rear-hub', posSuspension05),
  ],
  lighting: [
    file('lighting-01-left-xenon-headlight', posLighting01),
    file('lighting-02-angel-eyes-pair', posLighting02),
    file('lighting-03-right-tail-light', posLighting03),
    file('lighting-04-xenon-ballast', posLighting04),
    file('lighting-05-left-fog-light', posLighting05),
  ],
  body: [
    file('body-01-kidney-grilles', posBody01),
    file('body-02-m-front-bumper', posBody02),
    file('body-03-hood', posBody03),
    file('body-04-left-mirror', posBody04),
    file('body-05-trunk-lid', posBody05),
  ],
  electronics: [
    file('electronics-01-dme-module', posElectronics01),
    file('electronics-02-board-computer', posElectronics02),
    file('electronics-03-instrument-cluster', posElectronics03),
    file('electronics-04-comfort-module', posElectronics04),
    file('electronics-05-front-abs-sensor', posElectronics05),
  ],
  interior: [
    file('interior-01-m-tech-wheel', posInterior01),
    file('interior-02-sport-seats', posInterior02),
    file('interior-03-dashboard', posInterior03),
    file('interior-04-door-cards', posInterior04),
    file('interior-05-headliner', posInterior05),
  ],
}
