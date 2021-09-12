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
        $('#content').empty().append(input, '<hr style="display:none">', btnProfile, `<hr style="display:none"><table class="table table-bordered table-striped"><tr class="removeFromTable"></tr></table>`)
        input.focus()

        const addToTable = (key, value) => $('.table').append(`<tr class="removeFromTable"><th width="20%">${key}</th><td>${value}</td></tr>`)
        addToTable.if = (key, value, logic = value) => {
            if (logic) addToTable(key, value)
        }

        const yn = c => c ? 'כן' : 'לא'

        require(['autocomplete'], a => a.user(input, (ev, ui) => $.getJSON(`/api/user/${ui.item.user.userslug}`, d => {
            input.blur()
            $('.removeFromTable').remove()
            btnProfile.text(`הפרופיל של${d.isSelf ? 'י' : ` ${utils.decodeHTMLEntities(d.username)}`}`).attr('href', `/user/${d.userslug}`).add('hr').css('display', 'block')

            addToTable('מזהה משתמש', d.uid)
            addToTable('שם משתמש', d.username)
            addToTable('תיוג משתמש', `@${d.userslug}`)
            addToTable.if('דוא"ל', `<a href="mailto:${d.email}">${d.email}</a>`, d.email)
            addToTable('דוא"ל אומת', yn(d["email:confirmed"]))
            addToTable.if('תמונת פרופיל', `<img class="avatar avatar-xl" src="${d.picture}">`, d.picture)
            addToTable('סמל', `<div class="avatar avatar-xl" style="background:${d["icon:bgColor"]}">${d["icon:text"]}</div>`)
            addToTable.if('שם מלא', d.fullname)
            addToTable.if('מיקום', d.location)
            addToTable.if('יום הולדת', d.birthday)
            addToTable.if('אתר', `<a href="${d.website}">${d.website}</a>`, d.website)
            if (d.aboutme && d.aboutmeParsed) {
                addToTable('אודותיי - מקור', d.aboutme)
                addToTable('אודותיי - תצוגה', `<span class="text-center aboutme">${d.aboutmeParsed}</span>`)
            }
            addToTable.if('חתימה', d.signature)
            addToTable.if('גיל', d.age)
            addToTable('מורחק', yn(d.banned))
            addToTable('מצב', d.status == 'online' ? 'מחובר' : d.status == 'away' ? 'לא נמצא' : d.status == 'dnd' ? 'נא לא להפריע' : 'מנותק')
            addToTable.if('תמונת רקע', `<img src="${d["cover:url"]}" width="50%">`, d["cover:url"] != '/assets/images/cover-default.png')
            addToTable('מוניטין', utils.addCommas(d.reputation))
            addToTable('צפיות בפרופיל', utils.addCommas(d.profileviews))
            addToTable('פוסטים', utils.addCommas(d.counts.posts))
            // addToTable.if('פוסטים - כולל מחוקים', utils.addCommas(d.postcount), d.counts.posts != d.postcount)
            addToTable('נושאים', utils.addCommas(d.counts.topics))
            // addToTable.if('נושאים - כולל מחוקים', utils.addCommas(d.topiccount), d.counts.topics != d.topiccount)
            addToTable('פוסטים עם לייקים', utils.addCommas(d.counts.best))
            addToTable('עוקבים', d.counts.followers)
            addToTable('עוקב אחרי', d.counts.following)
            addToTable('קבוצות', d.counts.groups)
            $(d.groups).each((i, e) => addToTable(`קבוצה ${i + 1}`, e.name + (e.description ? ` (${e.description})` : '')))
            $(d.sso).each((i, e) => addToTable(`משוייך ל${e.name}`, yn(e.associated)))

            if (!d.isSelf) {
                $('.table').append('<tr class="removeFromTable"><td colspan="2"></td></tr>')
                addToTable(`${d.username} חסום אצלי`, yn(d.isBlocked))
                addToTable(`אני עוקב אחרי ${d.username}`, yn(d.isFollowing))
            }
        })))
        setTimeout(() => document.title = document.title.replace('לא נמצא', title))
    }
})
