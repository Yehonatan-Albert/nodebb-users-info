// ==UserScript==
// @name         מידע משתמשים
// @match        https://mitmachim.top/*
// @match        https://tchumim.com/*
// @grant        none
// ==/UserScript==

const path = '/users-info', title = 'מידע משתמשים'

$('#main-nav').append(
    $(document.createElement('li')).append(
        $(document.createElement('a')).addClass('navigation-link').attr({'href': path, 'title': '', 'data-original-title': title}).append(
            $(document.createElement('i')).addClass('fa fa-fw fa-users-cog')
        )
    )
)
// $('#main-nav').append(`<li><a class="navigation-link" href="${path}" title="" data-original-title="${title}"><i class="fa fa-fw fa-users-cog"></i></a></li>`)

$(window).on('action:ajaxify.end', () => {
    if (location.pathname == path) {
        const input = $(document.createElement('input')).addClass('form-control').attr('placeholder', 'חיפוש משתמש')
        const btnProfile = $(document.createElement('a')).addClass('btn btn-primary').css('display', 'none').attr('target', '_blank')
        $('#content').empty().append(input, '<hr style="display:none">', btnProfile, '<hr style="display:none"><table class="table table-bordered table-striped" id="table"><tr class="removeFromTable"></tr></table>')
        input.focus()

        const addToTable = (key, value) => $('#table').append(`<tr class="removeFromTable"><th width="20%">${key}</th><td>${value}</td></tr>`)

        const addToTableIf = (key, value, logic = value) => {
            if (logic) addToTable(key, value)
        }

        const yn = c => c ? 'כן' : 'לא'

        const link = (href, text = href, blank = true) => `<a href="${href}" target="${blank ? '_blank' : '_self'}">${text}</a>`

        require(['autocomplete'], a => a.user(input, (ev, ui) => {
            input.blur()
            $.getJSON(`/api/user/${ui.item.user.userslug}`, d => {
                $('.removeFromTable').remove()
                btnProfile.text(`הפרופיל של${d.isSelf ? 'י' : ` ${utils.decodeHTMLEntities(d.username)}`}`).attr('href', d.url).add('hr').css('display', 'block')

                addToTable('מזהה משתמש', d.uid)
                addToTable('שם משתמש', d.username)
                addToTable('תיוג', `@${d.userslug}`)
                addToTableIf('דוא"ל', link(`mailto:${d.email}`, d.email), d.email)
                addToTable('דוא"ל אומת', yn(d["email:confirmed"]))
                addToTableIf(link(d.picture, 'תמונת פרופיל'), `<img class="avatar avatar-xl" src="${d.picture}">`, d.picture)
                addToTable('סמל', `<div class="avatar avatar-xl" style="background:${d["icon:bgColor"]}">${d["icon:text"]}</div>`)
                addToTableIf('שם מלא', d.fullname)
                addToTableIf('מיקום', d.location)
                addToTableIf('יום הולדת', d.birthday)
                addToTableIf('אתר', link(d.website), d.website)
                if (d.aboutme && d.aboutmeParsed) {
                    addToTable('אודותיי - מקור', d.aboutme)
                    addToTable('אודותיי - תצוגה', `<span class="text-center aboutme">${d.aboutmeParsed}</span>`)
                }
                addToTableIf('חתימה', d.signature)
                addToTableIf('גיל', d.age)
                addToTable('מורחק', yn(d.banned))
                addToTable('מצב', d.status == 'online' ? 'מחובר' : d.status == 'away' ? 'לא נמצא' : d.status == 'dnd' ? 'נא לא להפריע' : 'מנותק')
                addToTableIf(link(d["cover:url"], 'תמונת רקע'), `<img src="${d["cover:url"]}" width="50%">`, d["cover:url"] != '/assets/images/cover-default.png')
                addToTable('מוניטין', utils.addCommas(d.reputation))
                addToTable('צפיות בפרופיל', utils.addCommas(d.profileviews))
                addToTable(link(`${d.url}/posts`, 'פוסטים'), utils.addCommas(d.counts.posts))
                // addToTable('פוסטים מחוקים', utils.addCommas(d.postcount - d.counts.posts))
                // addToTableIf('כל הפוסטים', utils.addCommas(d.postcount), d.postcount != d.counts.posts)
                addToTable(link(`${d.url}/best`, 'פוסטים עם לייקים'), utils.addCommas(d.counts.best))
                addToTable(link(`${d.url}/topics`, 'נושאים'), utils.addCommas(d.counts.topics))
                // addToTable('נושאים מחוקים', utils.addCommas(d.topiccount - d.counts.topics))
                // addToTableIf('כל הנושאים', utils.addCommas(d.topiccount), d.topiccount != d.counts.topics)
                addToTable(link(`${d.url}/followers`, 'עוקבים'), d.counts.followers)
                addToTable(link(`${d.url}/following`, 'עוקב אחרי'), d.counts.following)
                addToTable(link(`${d.url}/groups`, 'קבוצות'), d.counts.groups)
                $(d.groups).each((i, e) => addToTable(`קבוצה ${i + 1}`, link(`/groups/${e.slug}`, e.name) + (e.description ? ` (${e.description})` : '')))
                $(d.sso).each((i, e) => addToTable(`משוייך ל${e.name}`, yn(e.associated)))
                // addToTableIf(link(`/post/${d.latestPosts[0].pid}`, 'הפוסט האחרון'), d.latestPosts[0].content)
                // addToTableIf(link(`/post/${d.bestPosts[0].pid}`, 'הפוסט עם הכי הרבה לייקים'), d.bestPosts[0].content)

                if (!d.isSelf) {
                    $('#table').append('<tr class="removeFromTable"><td colspan="2"></td></tr>')
                    addToTable(`${d.username} חסום אצלי`, yn(d.isBlocked))
                    addToTable(`אני עוקב אחרי ${d.username}`, yn(d.isFollowing))
                    addToTable('צ\'אט', (d.hasPrivateChat ? `<button class="btn btn-default" style="margin-left:10px" onclick="app.openChat(${d.hasPrivateChat})">המשך צ'אט עם ${d.username}</button>` : '')
                    + `<button class="btn btn-default" onclick="app.newChat(${d.uid})">התחל צ'אט עם ${d.username}</button>`)
                }
            })
        }))
        setTimeout(() => document.title = document.title.replace('לא נמצא', title))
    }
})
