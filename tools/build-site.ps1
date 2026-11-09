# Builds the static site from tools/catalog.json:
#   1. model pages (<slug>.html) for every catalog entry that has a "page" block
#   2. the shared navbar (category dropdowns) and footer, written into every *.html in the root
#
# Usage (from the project root):  powershell -ExecutionPolicy Bypass -File tools\build-site.ps1
# Edit tools/catalog.json (names, categories, stats) or tools/model-template.html, then re-run.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Web
$utf8 = New-Object System.Text.UTF8Encoding $false

function Enc([string]$s) { return [System.Web.HttpUtility]::HtmlEncode($s) }
function ReadText([string]$p) { return [IO.File]::ReadAllText((Join-Path $root $p), [Text.Encoding]::UTF8) }
function WriteText([string]$p, [string]$t) { [IO.File]::WriteAllText((Join-Path $root $p), $t, $utf8) }
function ImgSize([string]$p) { $i = [System.Drawing.Image]::FromFile((Join-Path $root $p)); $r = @($i.Width, $i.Height); $i.Dispose(); return $r }

$catalog = (ReadText "tools\catalog.json") | ConvertFrom-Json
$models = $catalog.models
function Model([string]$id) { return $models.$id }
function Href([string]$id) { $m = Model $id; if ($m.href) { return $m.href } return "$id.html" }

# ---------------------------------------------------------------- navbar
$chev = '<svg class="navmenu__chevron" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
$sb = New-Object Text.StringBuilder
foreach ($cat in $catalog.categories) {
  [void]$sb.AppendLine("        <div class=`"navmenu`" data-navmenu>")
  [void]$sb.AppendLine("          <button class=`"navmenu__trigger`" type=`"button`" aria-expanded=`"false`" aria-controls=`"menu-$($cat.id)`">$(Enc $cat.label)$chev</button>")
  [void]$sb.AppendLine("          <div class=`"navmenu__panel`" id=`"menu-$($cat.id)`">")
  [void]$sb.AppendLine("            <ul class=`"navmenu__grid`">")
  foreach ($id in $cat.models) {
    $m = Model $id
    [void]$sb.AppendLine("              <li><a class=`"navmenu__card`" href=`"$(Href $id)`"><img src=`"assets/thumbs/$id.jpg`" width=`"400`" height=`"240`" alt=`"`" loading=`"lazy`"><span class=`"navmenu__name`">$(Enc $m.name)</span><span class=`"navmenu__desc`">$(Enc $m.desc)</span></a></li>")
  }
  [void]$sb.AppendLine("            </ul>")
  [void]$sb.AppendLine("          </div>")
  [void]$sb.AppendLine("        </div>")
}
$navInner = $sb.ToString().TrimEnd()
$navTemplate = @"
<header class="{{CLASS}}" data-navbar>
    <div class="navbar__container">
      <a class="navbar__logo logo" href="index.html" aria-label="Нүүр хуудас">
        <img src="assets/brand-logo-transparent.png" width="57" height="36" alt="Tesla">
      </a>

      <nav class="navbar__links" id="nav-links" aria-label="Загварууд">
$navInner
      </nav>

      <div class="navbar__actions">
        <a class="btn btn--primary btn--nav" href="#test-drive" aria-label="Туршилтын жолоодлого">
          <span class="btn__label-long">Туршилтын жолоодлого</span>
          <span class="btn__label-short">Турших</span>
        </a>
        <button class="navbar__toggle" type="button" aria-controls="nav-links" aria-expanded="false">Цэс</button>
      </div>
    </div>
  </header>
"@

# ---------------------------------------------------------------- footer
$sb = New-Object Text.StringBuilder
foreach ($cat in $catalog.categories) {
  [void]$sb.AppendLine("          <div class=`"site-footer__group`">")
  [void]$sb.AppendLine("            <h3>$(Enc $cat.label)</h3>")
  [void]$sb.AppendLine("            <ul>")
  foreach ($id in $cat.models) {
    $m = Model $id
    [void]$sb.AppendLine("              <li><a href=`"$(Href $id)`"><span class=`"site-footer__model`">$(Enc $m.name)</span> <span class=`"site-footer__desc`">$(Enc $m.desc)</span></a></li>")
  }
  [void]$sb.AppendLine("            </ul>")
  [void]$sb.AppendLine("          </div>")
}
$footerGroups = $sb.ToString().TrimEnd()
$footer = (ReadText "tools\footer-template.html").Replace("{{MODEL_GROUPS}}", $footerGroups).TrimEnd()

# ---------------------------------------------------------------- spec tables
$fixes = [ordered]@{
  "Нүүр хуудасэлтүүлэг" = "Гэрэлтүүлэг"; "Нүүр хуудаслийн" = "Гэрлийн"; "Нүүр хуудасэл" = "Гэрэл"; "Нүүр хуудас" = "Гэр";
  "Миль (км)" = "Цэнэглэлтийн зай (км)"; "Драйвын хэлбэр" = "Хөтлөгчийн хэлбэр"; "Драйверийн төрөл" = "Хөтлөгчийн төрөл";
  "Хатуу жин" = "Өөрийн жин"; "Савны хэмжээ" = "Тэвшний хэмжээ"; "Савны өндөр" = "Тэвшний өндөр"; "Ванны" = "Тэвшний";
  "аялалын зай" = "явах зай"; "үйл ажиллагааны миль" = "ажлын явах зай"; "Анхдагч" = "Pioneer"; "Rim" = "Обуд"; "\*" = "×"
}
function Fix([string]$s) { foreach ($k in $fixes.Keys) { $s = $s.Replace($k, $fixes[$k]) }; return $s.Trim() }

function SpecTable([string]$slug) {
  $file = "tools\specs\$slug.txt"
  if (-not (Test-Path (Join-Path $root $file))) { return "" }
  $rows = @()
  foreach ($line in ((ReadText $file) -split "`r?`n")) {
    foreach ($part in ($line -replace '\|\|', "|`n|") -split "`n") {
      if ($part -notmatch '^\|') { continue }
      if ($part -match '^\|[\s\-|:]*$') { continue }                       # empty or --- separator rows
      $cells = @($part.Trim().Trim('|').Split('|') | ForEach-Object { Fix $_ })
      if ($cells.Count -eq 0) { continue }
      if ($cells[0] -match 'үнэ|юань') { continue }                       # Chinese retail prices
      $vals = @($cells | Select-Object -Skip 1 | Where-Object { $_ -ne '' })
      if ($vals.Count -gt 0 -and @($vals | Where-Object { $_ -notmatch '^\d{5,6}$' }).Count -eq 0) { continue }   # price-only rows (per body type)
      $rows += ,$cells
    }
  }
  if ($rows.Count -eq 0) { return "" }
  $max = ($rows | ForEach-Object { $_.Count } | Measure-Object -Maximum).Maximum
  $sb = New-Object Text.StringBuilder
  $first = $true
  foreach ($r in $rows) {
    $rest = @($r | Select-Object -Skip 1 | Where-Object { $_ -ne '' })
    if ($rest.Count -eq 0) {
      [void]$sb.AppendLine("                <tr class=`"is-group`"><th colspan=`"$max`" scope=`"colgroup`">$(Enc $r[0])</th></tr>")
      continue
    }
    $cls = if ($first) { ' class="is-head"' } else { '' }; $first = $false
    $tds = New-Object Text.StringBuilder
    for ($i = 1; $i -lt $r.Count; $i++) {
      $span = if ($i -eq $r.Count - 1 -and $r.Count -lt $max) { " colspan=`"$($max - $r.Count + 1)`"" } else { "" }
      [void]$tds.Append("<td$span>$(Enc $r[$i])</td>")
    }
    [void]$sb.AppendLine("                <tr$cls><th scope=`"row`">$(Enc $r[0])</th>$($tds.ToString())</tr>")
  }
  return $sb.ToString().TrimEnd()
}

# ---------------------------------------------------------------- model pages
$template = ReadText "tools\model-template.html"
$generated = @()
foreach ($prop in $models.PSObject.Properties) {
  $slug = $prop.Name; $m = $prop.Value
  if (-not $m.page) { continue }
  $p = $m.page
  $catLabel = ($catalog.categories | Where-Object { $_.models -contains $slug } | Select-Object -First 1).label

  $size = ImgSize $p.hero
  $heroMax = [math]::Min(1100, [int]($size[0] * 1.5))

  # stats strip
  $stats = ""
  if ($p.stats -and @($p.stats).Count -gt 0) {
    $sb = New-Object Text.StringBuilder
    foreach ($s in $p.stats) {
      [void]$sb.AppendLine("          <div class=`"mstat`"><dt class=`"mstat__label`">$(Enc $s[2])</dt><dd class=`"mstat__value`">$(Enc $s[0])<span>$(Enc $s[1])</span></dd></div>")
    }
    $stats = "<dl class=`"mstats__list`">`n" + $sb.ToString().TrimEnd() + "`n        </dl>"
  }

  # gallery (assets/models/<slug>/g*.jpg, minus the hero)
  $gallery = ""
  $gdir = Join-Path $root "assets\models\$slug"
  if (Test-Path $gdir) {
    $imgs = Get-ChildItem $gdir -File | Where-Object { "assets/models/$slug/$($_.Name)" -ne $p.hero } | Sort-Object { [int]($_.BaseName -replace '\D', '') }
    if (@($imgs).Count -gt 0) {
      $sb = New-Object Text.StringBuilder
      foreach ($g in $imgs) {
        $gs = ImgSize "assets\models\$slug\$($g.Name)"
        [void]$sb.AppendLine("            <figure class=`"mcard mcard--plain`"><img src=`"assets/models/$slug/$($g.Name)`" width=`"$($gs[0])`" height=`"$($gs[1])`" alt=`"$(Enc $m.name) — зураг`" loading=`"lazy`"></figure>")
      }
      $gallery = (ReadText "tools\gallery-template.html").Replace("{{CARDS}}", $sb.ToString().TrimEnd())
    }
  }

  $table = SpecTable $slug
  $specs = if ($table) { (ReadText "tools\specs-template.html").Replace("{{ROWS}}", $table) } else {
    "<section class=`"section section--surface`" id=`"specs`"><div class=`"container`"><p class=`"text-medium`">Энэ загварын тохиргоог салбараас лавлана уу.</p></div></section>" }

  $sourceNote = if ($p.source -eq "dealer") { "Гол үзүүлэлтийг дилерийн техникийн хүснэгтээс, дэлгэрэнгүй хүснэгтийг үйлдвэрлэгчийн сайтаас авав." } else { "Үзүүлэлтийг үйлдвэрлэгчийн (rc-ev.com) мэдээллээс авав." }

  $html = $template.Replace("{{NAME}}", (Enc $m.name)).Replace("{{DESC}}", (Enc $m.desc)).Replace("{{CATEGORY}}", (Enc $catLabel)).
    Replace("{{TAGLINE}}", (Enc $p.tagline)).Replace("{{HERO}}", $p.hero).Replace("{{HERO_W}}", "$($size[0])").Replace("{{HERO_H}}", "$($size[1])").
    Replace("{{HERO_MAX}}", "$heroMax").Replace("{{STATS}}", $stats).Replace("{{GALLERY}}", $gallery).Replace("{{SPECS}}", $specs).
    Replace("{{SOURCE_NOTE}}", (Enc $sourceNote))
  WriteText "$slug.html" $html
  $generated += $slug
}
"generated pages: $($generated.Count) ($($generated -join ', '))"

# ---------------------------------------------------------------- inject navbar + footer into every page
foreach ($f in Get-ChildItem $root -Filter *.html -File) {
  $t = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
  $mh = [regex]::Match($t, '<header class="([^"]*navbar[^"]*)" data-navbar>.*?</header>', 'Singleline')
  if ($mh.Success) { $t = $t.Remove($mh.Index, $mh.Length).Insert($mh.Index, $navTemplate.Replace("{{CLASS}}", $mh.Groups[1].Value).TrimEnd()) }
  $mf = [regex]::Match($t, '<footer class="site-footer">.*?</footer>', 'Singleline')
  if ($mf.Success) { $t = $t.Remove($mf.Index, $mf.Length).Insert($mf.Index, $footer.TrimStart()) }
  [IO.File]::WriteAllText($f.FullName, $t, $utf8)
  "{0,-24} nav:{1} footer:{2}" -f $f.Name, $mh.Success, $mf.Success
}
