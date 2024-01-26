Game.win("Third-party");
if(typeof CCSE == "undefined") Game.LoadMod("https://klattmose.github.io/CookieClicker/CCSE.js");
if(ngplus === undefined) var ngplus = {};

ngplus.IN_BETA = true;
ngplus.name = "NG+";
ngplus.version = "0.1" + (ngplus.IN_BETA ? " (BETA)" : "");
ngplus.GameVersion = "2.052";

ngplus.started = false;

ngplus.launch = function(){
    ngplus.init = function(){
        ngplus.getAchievementAmount = function(){
            var achievements = 0;
            for (var i in Game.AchievementsById){
                var me = Game.AchievementsById[i];
                // dont count shadow achievements or anything that isnt in the normal pool
                if (me.pool != "normal") continue;
                if (me.won == 1) achievements++;
            }
            return achievements;
        }

        Game.customStatsMenu.push(function(){
            CCSE.AppendStatsVersionNumber(ngplus.name, ngplus.version);
        });

        Game.customOptionsMenu.push(function(){
            CCSE.AppendCollapsibleOptionsMenu(ngplus.name, ngplus.getMenuString());
        });

        CCSE.NewBuff("ngplus", function(_, _){
            let ach = ngplus.getAchievementAmount();
            return {
                name: "NG+ Buff",
                desc: "You are in NG+!<br>All cookie gain is doubled.<br> \
                Sugar lumps ripen a LOT faster.<br> \
                Your " + ach + " achievements are giving a " + ach + "% boost to your CpS and clicking power.",
                icon: [0, 0],
                time: 100000000000,
                add: 0,
                power: 0,
            };
        });

        Game.customComputeLumpTimes.push(function(){
            if (!Game.hasBuff("ngplus")) return;
            Game.lumpMatureAge = 500;
			Game.lumpRipeAge = 1000;
			Game.lumpOverripeAge = 5000;
        });

        // so that it knows to give the buff when you load a save
        CCSE.customSave.push(function(){
            CCSE.config.OtherMods.ngplus = ngplus.started;
        });
        CCSE.customLoad.push(function() {
            if (CCSE.config.OtherMods.ngplus) {
                ngplus.started = true;
            }
        });
        
        ngplus.isLoaded = 1;
    }
    ngplus.init();

    ngplus.getMenuString = function(){
        str = CCSE.MenuHelper.Header("NG+ Options");
        str += CCSE.MenuHelper.ActionButton("ngplus.reset();", "Start NG+");
        return str;
    }

    ngplus.reset = function(){
        if (!confirm("Are you sure you want to start NG+?\nThis will reset your save!")) return;
        Game.Reset(true);
        // reset achievements just in case
        for (var i in Game.AchievementsById){
            var me = Game.AchievementsById[i];
            // dont remove third-party
            if (me.name.indexOf("Third-party") != -1) continue;
            if (me.won == 1) me.won = 0;
        }
        Game.Popup("NG+ started!");
        ngplus.started = true;

        addNGPlusBuff();
    }

    if (Game.prefs.popups) Game.Popup(ngplus.name + " loaded!");
    else Game.Notify(ngplus.name + " loaded!", "", "", 1, 1);
}

if (!ngplus.isLoaded){
    setInterval(function() {
        var ngplusBuff = Game.buffs["ngplus"];
        if (!ngplusBuff && ngplus.started) {
            addNGPlusBuff();
        }
    }, 1000);
    if(CCSE && CCSE.isLoaded){
        ngplus.launch();
    }
    else{
        if(!CCSE) var CCSE = {};
        if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
        CCSE.postLoadHooks.push(ngplus.launch);
    }
}

function addNGPlusBuff() {
    let buff = Game.gainBuff("ngplus");
    buff.desc = "You are in NG+!<br>Everything is twice as powerful!<br>Your " + ngplus.getAchievementAmount() + " achievements are giving a " + ngplus.getAchievementAmount() + "% boost to your CpS and clicking power!";
    let base = 2 + ngplus.getAchievementAmount() / 100;
    buff.multCpS = base;
    buff.multClick = base;
}
